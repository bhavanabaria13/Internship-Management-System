import type { Express } from "express";
import { type Server } from "http";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { sendThankYouEmail, sendAdminNotification } from "./email";
import { generateInternsExcel } from "./excel";
import fs from "fs";
import ExcelJS from "exceljs";
import { randomUUID } from "crypto";
import { z } from "zod";
import { weeklyUpdateSchema, trainingWeeks, trainingTopics, trainingSubtopics, internTrainingProgress, internCertificates } from "../shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const internSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  workExperience: z.string().optional(),
  education: z.string().min(1),
  city: z.string().min(1),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  skills: z.string().min(1),
  projects: z.string().optional(),
});

const PostgresStore = pgSession(session);
const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
    internId?: string;
  }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PostgresStore({
        pool: sessionPool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      name: "intern_admin_sid",
      secret: process.env.SESSION_SECRET || "internship-portal-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset maxAge on every request
      cookie: {
        secure: false, // Set to false for development
        httpOnly: true,
        sameSite: "lax", // Use lax for better compatibility
        maxAge: 24 * 60 * 60 * 1000,
        path: "/", // Ensure cookie is available for all paths
      },
    }),
  );

  const requireAdmin = (req: any, res: any, next: any) => {
    console.log("requireAdmin check:", {
      path: req.path,
      isAdmin: req.session?.isAdmin,
      sessionID: req.sessionID,
      hasSession: !!req.session
    });

    if (req.session?.isAdmin) {
      next();
    } else {
      console.log("Admin authorization failed for:", req.path);
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Mock requireAuth for the changes to apply, as it's not defined in the original code
  // In a real scenario, this would be imported and used correctly.
  const requireAuth = (req: any, res: any, next: any) => {
    // Placeholder logic, assuming it checks for some authentication
    if (req.session?.userId || req.session?.isAdmin) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };


  app.post("/api/admin/login", (req, res) => {
    const validation = adminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { username, password } = validation.data;
    console.log("Admin login attempt:", { username });

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Admin login successful, session saved:", {
          sessionID: req.sessionID,
          isAdmin: req.session.isAdmin
        });
        res.json({ message: "Login successful" });
      });
    } else {
      console.log("Invalid credentials provided");
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Setup all interns with common password
  app.post("/api/setup-all-interns", async (req, res) => {
    try {
      const allInterns = await storage.getAllInterns();
      const hashedPassword = await bcrypt.hash("123456", 10);

      let updated = 0;
      let created = 0;

      for (const intern of allInterns) {
        const existingUser = await storage.getInternUserByInternId(intern.id);

        if (!existingUser) {
          // Create new user account
          await storage.createInternUser(intern.id, "123456");
          created++;
        } else {
          // Update password and approve
          await storage.updateInternPassword(intern.id, hashedPassword);
          await storage.updateInternApproval(intern.id, 1);
          updated++;
        }
      }

      console.log(`Setup complete: ${created} created, ${updated} updated`);

      res.json({ 
        message: "All intern accounts setup successfully",
        password: "123456",
        total: allInterns.length,
        created,
        updated
      });
    } catch (error) {
      console.error("Failed to setup interns:", error);
      res.status(500).json({ message: "Failed to setup interns" });
    }
  });

  // Setup test intern account (for testing only)
  app.post("/api/setup-test-intern", async (req, res) => {
    try {
      // Check if intern exists
      const existingInterns = await storage.getAllInterns();
      const existingIntern = existingInterns.find(i => i.email === "i@gmail.com");

      let internId: string;
      if (!existingIntern) {
        // Create test intern
        const intern = await storage.createIntern({
          name: "Test Intern",
          email: "i@gmail.com",
          phone: "1234567890",
          workExperience: "Test Experience",
          education: "Computer Science",
          city: "Test City",
          github: "https://github.com/test",
          linkedin: "https://linkedin.com/in/test",
          skills: "JavaScript, React, Node.js",
          projects: "Test Projects"
        });
        internId = intern.id;
      } else {
        internId = existingIntern.id;
      }

      // Create or update intern user with password "123456"
      const hashedPassword = await bcrypt.hash("123456", 10);
      const existingUser = await storage.getInternUserByInternId(internId);

      if (!existingUser) {
        await storage.createInternUser(internId, "123456");
      } else {
        // Update password and approval status
        await storage.updateInternPassword(internId, hashedPassword);
        await storage.updateInternApproval(internId, 1);
      }

      console.log("Test intern setup complete");
      console.log("Intern ID:", internId);
      console.log("Password hash:", hashedPassword);

      res.json({ 
        message: "Test intern account created/updated",
        email: "i@gmail.com",
        password: "123456",
        internId
      });
    } catch (error) {
      console.error("Failed to setup test intern:", error);
      res.status(500).json({ message: "Failed to setup test intern" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    console.log("Admin check - session data:", {
      isAdmin: req.session?.isAdmin,
      sessionID: req.sessionID,
      cookie: req.session?.cookie
    });
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  app.post("/api/interns", upload.single("cv"), async (req, res) => {
    try {
      console.log("=== APPLICATION SUBMISSION RECEIVED ===");
      console.log("Has file:", !!req.file);
      console.log("Body keys:", Object.keys(req.body));
      console.log("Body data:", req.body);

      const validation = internSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("=== VALIDATION FAILED ===");
        console.error("Validation errors:", validation.error.errors);
        return res.status(400).json({
          message: "Validation failed. Please check all required fields.",
          errors: validation.error.errors,
        });
      }

      console.log("Validation passed successfully");

      // Check if email already exists
      const existingInterns = await storage.getAllInterns();
      const emailExists = existingInterns.some(i => i.email.toLowerCase() === validation.data.email.toLowerCase());

      if (emailExists) {
        console.log("Duplicate email detected:", validation.data.email);
        return res.status(400).json({
          message: "An application with this email already exists. Please use a different email."
        });
      }

      const internData = {
        ...validation.data,
        cvFilename: req.file?.filename,
        cvOriginalName: req.file?.originalname,
      };

      const intern = await storage.createIntern(internData);
      console.log("Intern created successfully:", intern.id);

      // Send emails asynchronously without blocking
      sendThankYouEmail(intern.email, intern.name).catch(err => 
        console.error("Email send failed:", err)
      );
      sendAdminNotification(intern.name, intern.email).catch(err => 
        console.error("Admin notification failed:", err)
      );

      res.status(201).json(intern);
    } catch (error: any) {
      console.error("=== APPLICATION SUBMISSION ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error code:", error.code);

      if (error.code === '23505') {
        return res.status(400).json({ 
          message: "An application with this email already exists." 
        });
      }

      if (error.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
          message: "Database connection error. Please try again in a moment." 
        });
      }

      res.status(500).json({ 
        message: error.message || "Failed to submit application. Please try again." 
      });
    }
  });

  app.get("/api/interns", requireAdmin, async (_req, res) => {
    try {
      const interns = await storage.getAllInterns();
      res.json(interns);
    } catch (error) {
      console.error("Error fetching interns:", error);
      res.status(500).json({ message: "Failed to fetch interns" });
    }
  });

  app.get("/api/interns/export", requireAdmin, async (_req, res) => {
    try {
      const buffer = await generateInternsExcel();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=interns-${Date.now()}.xlsx`,
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting interns:", error);
      res.status(500).json({ message: "Failed to export interns" });
    }
  });

  app.get("/api/interns/:id", requireAdmin, async (req, res) => {
    try {
      const intern = await storage.getInternById(req.params.id);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }
      res.json(intern);
    } catch (error) {
      console.error("Error fetching intern:", error);
      res.status(500).json({ message: "Failed to fetch intern" });
    }
  });

app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const interns = await storage.getAllInterns();
    console.log("ADMIN STATS interns:", interns.length);

    const projects = await storage.getAllProjects();
    const tasks = await storage.getAllTasks();
    const weeklyUpdates = await storage.getAllWeeklyUpdates();

    res.json({
      totalInterns: interns.length,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalWeeklyUpdates: weeklyUpdates.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});


  app.put("/api/interns/:id", requireAdmin, async (req, res) => {
    try {
      console.log("Updating intern:", req.params.id, "with data:", req.body);
      const { approvalStatus, ...internData } = req.body;
      const intern = await storage.updateIntern(req.params.id, internData);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }
      console.log("Intern updated successfully:", intern.id);
      res.json(intern);
    } catch (error) {
      console.error("Error updating intern:", error);
      res.status(500).json({ message: "Failed to update intern" });
    }
  });

  app.delete("/api/interns/:id", requireAdmin, async (req, res) => {
    try {
      console.log("Deleting intern:", req.params.id);
      const intern = await storage.getInternById(req.params.id);
      if (intern?.cvFilename) {
        const cvPath = path.join(uploadDir, intern.cvFilename);
        if (fs.existsSync(cvPath)) {
          fs.unlinkSync(cvPath);
        }
      }

      const success = await storage.deleteIntern(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Intern not found" });
      }
      console.log("Intern deleted successfully:", req.params.id);
      res.json({ message: "Intern deleted successfully" });
    } catch (error) {
      console.error("Error deleting intern:", error);
      res.status(500).json({ message: "Failed to delete intern" });
    }
  });

  app.get("/api/interns/:id/cv", requireAdmin, async (req, res) => {
    try {
      const intern = await storage.getInternById(req.params.id);
      if (!intern || !intern.cvFilename) {
        return res.status(404).json({ message: "CV not found" });
      }

      const cvPath = path.join(uploadDir, intern.cvFilename);
      if (!fs.existsSync(cvPath)) {
        return res.status(404).json({ message: "CV file not found" });
      }

      res.download(cvPath, intern.cvOriginalName || intern.cvFilename);
    } catch (error) {
      console.error("Error downloading CV:", error);
      res.status(500).json({ message: "Failed to download CV" });
    }
  });

  // Weekly Updates Routes
  app.post("/api/weekly-updates", requireAdmin, async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const data = weeklyUpdateSchema.parse(req.body);
      const update = await storage.createWeeklyUpdate(data);
      res.json(update);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  app.get("/api/weekly-updates", requireAdmin, async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const updates = await storage.getAllWeeklyUpdates();
      res.json(updates);
    } catch (error) {
      console.error("Error fetching weekly updates:", error);
      res.status(500).json({ message: "Failed to fetch weekly updates" });
    }
  });

  app.get("/api/interns/:internId/weekly-updates", requireAdmin, async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const updates = await storage.getWeeklyUpdatesByIntern(req.params.internId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch updates" });
    }
  });

 app.put("/api/weekly-updates/:id", requireAdmin, async (req, res) => {
  try {
    console.log("NORMALIZED:", req.body);

    const data = weeklyUpdateSchema.partial().parse(req.body);

    console.log("PARSED:", data);

    const update = await storage.updateWeeklyUpdate(req.params.id, data);
    res.json(update);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Invalid data" });
  }
});

  app.delete("/api/weekly-updates/:id", requireAdmin, async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.deleteWeeklyUpdate(req.params.id);
      res.json({ message: "Update deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete update" });
    }
  });

  // Intern Approval Routes
  app.get("/api/admin/pending-interns", requireAdmin, async (_req, res) => {
    try {
      const interns = await storage.getAllPendingInterns();
      res.json(interns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending interns" });
    }
  });

  app.post("/api/admin/approve-intern/:internId", requireAdmin, async (req, res) => {
    try {
      console.log("Approving intern:", req.params.internId);
      const { password } = req.body;
      const defaultPassword = password || "123456";

      // Get intern details for email
      const intern = await storage.getInternById(req.params.internId);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }

      // Create intern user account
      const existingUser = await storage.getInternUserByInternId(req.params.internId);
      if (!existingUser) {
        await storage.createInternUser(req.params.internId, defaultPassword);
        console.log("Created new user account for intern:", req.params.internId);
      } else {
        await storage.updateInternApproval(req.params.internId, 1);
        console.log("Updated approval status for intern:", req.params.internId);
      }

      // Send approval email with credentials
      const { sendApprovalEmail } = await import("./email");
      await sendApprovalEmail(intern.email, intern.name, defaultPassword);
      console.log("Approval email sent to:", intern.email);

      res.json({ message: "Intern approved and email sent", defaultPassword });
    } catch (error) {
      console.error("Failed to approve intern:", error);
      res.status(500).json({ message: "Failed to approve intern" });
    }
  });

  app.post("/api/admin/reject-intern/:internId", requireAdmin, async (req, res) => {
    try {
      console.log("Rejecting intern:", req.params.internId);
      await storage.updateInternApproval(req.params.internId, 2);
      console.log("Intern rejected successfully:", req.params.internId);
      res.json({ message: "Intern rejected" });
    } catch (error) {
      console.error("Failed to reject intern:", error);
      res.status(500).json({ message: "Failed to reject intern" });
    }
  });

  app.get("/api/admin/interns-with-status", requireAdmin, async (_req, res) => {
    try {
      const interns = await storage.getAllInternsWithStatus();
      res.json(interns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interns" });
    }
  });

  // Task Routes
 app.post("/api/tasks", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      projectId,   // ✅ ADD THIS
      priority,
      dueDate,
    } = req.body;

    const task = await storage.createTask({
      title,
      description,
      assignedTo: assignedTo || null,
      projectId: projectId || null, // ✅ PASS TO STORAGE
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: "admin",
    });

    // Notification
    if (assignedTo) {
      await storage.createNotification({
        internId: assignedTo,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: "${title}"`,
        relatedTaskId: task.id,
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

  app.get("/api/tasks", requireAdmin, async (_req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

 app.put("/api/tasks/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignedTo,
      projectId,   // ✅ ADD
      priority,
      status,
      dueDate,
    } = req.body;

    const task = await storage.updateTask(id, {
      title,
      description,
      assignedTo: assignedTo || null,
      projectId: projectId || null, // ✅ ADD
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

  app.delete("/api/tasks/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Intern Dashboard Routes
  const requireIntern = (req: any, res: any, next: any) => {
    console.log("requireIntern check:", {
      path: req.path,
      internId: req.session?.internId,
      sessionID: req.sessionID,
      hasSession: !!req.session
    });

    if (req.session?.internId) {
      next();
    } else {
      console.log("Intern authorization failed for:", req.path);
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  app.post("/api/intern/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", email);
      console.log("Password provided:", password ? "Yes" : "No");
      console.log("Session before login:", req.sessionID);

      // First check if intern exists in the system
      const allInterns = await storage.getAllInterns();
      const internExists = allInterns.find(i => i.email.toLowerCase() === email.toLowerCase());

      console.log("Intern exists in database:", internExists ? "Yes" : "No");
      if (internExists) {
        console.log("Intern ID:", internExists.id);
      }

      if (!internExists) {
        console.log("ERROR: Intern record not found for email:", email);
        return res.status(401).json({ 
          message: "Invalid credentials - account not found" 
        });
      }

      // Check if user account exists
      const user = await storage.getInternUserByEmail(email);
      console.log("User account found:", user ? "Yes" : "No");

      if (!user) {
        console.log("ERROR: User account not created yet for intern:", internExists.id);

        // Auto-create the user account with default password
        try {
          console.log("Auto-creating user account with password: 123456");
          await storage.createInternUser(internExists.id, "123456");
          await storage.updateInternApproval(internExists.id, 1);
          console.log("User account created successfully");

          // If they used 123456 as password, log them in
          if (password === "123456") {
            req.session.internId = internExists.id;
            req.session.save((err) => {
              if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: "Login failed" });
              }
              console.log("Login successful after auto-creation for:", email);
              return res.json({ 
                message: "Login successful", 
                intern: {
                  id: internExists.id,
                  name: internExists.name,
                  email: internExists.email
                }
              });
            });
            return;
          }
        } catch (createError) {
          console.error("Failed to auto-create user account:", createError);
        }

        return res.status(401).json({ 
          message: "Account not approved yet. Default password is 123456"
        });
      }

      console.log("Verifying password...");
      const valid = await bcrypt.compare(password, user.password);
      console.log("Password valid:", valid);

      if (!valid) {
        console.log("ERROR: Invalid password");
        return res.status(401).json({ 
          message: "Invalid credentials - account not found" 
        });
      }

      if (user.isApproved !== 1) {
        console.log("ERROR: Account not approved");
        return res.status(403).json({ 
          message: "Account pending approval" 
        });
      }

      req.session.internId = user.internId;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("=== LOGIN SUCCESSFUL ===");
        console.log("Intern ID:", user.internId);
        console.log("Session ID:", req.sessionID);
        console.log("Session internId set to:", req.session.internId);
        res.json({ 
          message: "Login successful", 
          intern: {
            id: user.internId,
            name: internExists.name,
            email: internExists.email
          }
        });
      });
    } catch (error) {
      console.error("=== LOGIN ERROR ===");
      console.error(error);
      res.status(500).json({ message: "Invalid credentials - account not found" });
    }
  });

  app.post("/api/intern/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/intern/tasks", requireIntern, async (req, res) => {
    try {
      const tasks = await storage.getTasksByIntern(req.session.internId!);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  
 app.post("/api/intern/tasks/:id/start", requireIntern, async (req, res) => {
  try {
    const internId = req.session.internId!;
    const taskId = req.params.id;

    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "completed" || task.status === "cancelled") {
      return res.status(400).json({ message: "Cannot start this task" });
    }

    // 🔥 CHECK ANY ACTIVE TASK
    const activeLog = await storage.getActiveTimeLog(internId);

    if (activeLog) {
      // Stop previous task automatically
      await storage.endTimeLog(activeLog.id, new Date());
      await storage.updateTask(activeLog.taskId, { status: "pending" });
    }

    // Start new task
    await storage.updateTask(taskId, { status: "running" });

    const newLog = await storage.createTimeLog({
      internId,
      taskId,
      logType: "task",
      startTime: new Date(),
    });

    res.json(newLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start task" });
  }
});

   app.post("/api/intern/tasks/:id/stop", requireIntern, async (req, res) => {
    try {
      const activeLog = await storage.getActiveTimeLogForTask(req.session.internId!, req.params.id);
      if (!activeLog) {
        return res.status(404).json({ message: "No active time log for this task" });
      }

      const endedLog = await storage.endTimeLog(activeLog.id, new Date());

      // Keep task in running state so it can be restarted
      // Only change to pending if user wants to pause it
      await storage.updateTask(req.params.id, { status: "pending" });

      res.json({ 
        message: "Task timer stopped", 
        duration: endedLog?.duration || 0,
        log: endedLog 
      });
    } catch (error) {
      console.error("Error stopping task:", error);
      res.status(500).json({ message: "Failed to stop task" });
    }
  });

  app.post("/api/intern/tasks/:id/complete", requireIntern, async (req, res) => {
    try {
      const activeLog = await storage.getActiveTimeLog(req.session.internId!);
      let duration = 0;

      if (activeLog && activeLog.taskId === req.params.id) {
        const endedLog = await storage.endTimeLog(activeLog.id, new Date());
        duration = endedLog?.duration || 0;
      }

      await storage.updateTask(req.params.id, { status: "completed" });

      res.json({ 
        message: "Task completed", 
        duration 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.get("/api/intern/time-logs", requireIntern, async (req, res) => {
    try {
      const logs = await storage.getTimeLogsByIntern(req.session.internId!);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  app.post("/api/intern/weekly-updates", requireIntern, async (req, res) => {
    try {
      const data = weeklyUpdateSchema.parse({ ...req.body, internId: req.session.internId });
      const update = await storage.createWeeklyUpdate(data);
      res.json(update);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  app.get("/api/intern/my-weekly-updates", requireIntern, async (req, res) => {
    try {
      const updates = await storage.getWeeklyUpdatesByIntern(req.session.internId!);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch updates" });
    }
  });

  app.put("/api/intern/weekly-updates/:id", requireIntern, async (req, res) => {
    try {
      // Verify the update belongs to this intern
      const updates = await storage.getWeeklyUpdatesByIntern(req.session.internId!);
      const existing = updates.find(u => u.id === req.params.id);
      if (!existing) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const data = weeklyUpdateSchema.partial().parse(req.body);
      const update = await storage.updateWeeklyUpdate(req.params.id, data);
      res.json(update);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  app.delete("/api/intern/weekly-updates/:id", requireIntern, async (req, res) => {
    try {
      // Verify the update belongs to this intern
      const updates = await storage.getWeeklyUpdatesByIntern(req.session.internId!);
      const existing = updates.find(u => u.id === req.params.id);
      if (!existing) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteWeeklyUpdate(req.params.id);
      res.json({ message: "Update deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete update" });
    }
  });

  app.get("/api/admin/time-logs", requireAdmin, async (_req, res) => {
    try {
      const logs = await storage.getAllTimeLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  // Import spreadsheet data - note this is the backend route, frontend uses client-side parsing
app.post("/api/admin/import-spreadsheet", requireAdmin, async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Handle array-based rows OR object-with-numeric-keys
      const values = Array.isArray(row)
        ? row
        : Object.values(row);

      const name = values[0]?.toString().trim();
      const email = values[1]?.toString().trim();

      if (!name || !email) {
        skipped++;
        errors.push(`Row ${i + 1}: Missing name or email`);
        continue;
      }

      await storage.createIntern({
        name,
        email,
        phone: values[2] || "N/A",
        education: values[3] || "N/A",
        city: values[4] || "N/A",
        skills: values[5] || "N/A",
        work_experience: values[6] || "N/A",
        projects: values[7] || "N/A",
        github: values[8] || "N/A",
        linkedin: values[9] || "N/A",
      });

      imported++;
    }

    res.json({
      message: `Imported ${imported}, skipped ${skipped}`,
      imported,
      skipped,
      errors,
    });
  } catch (err: any) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

  app.post("/api/intern/time-log/end", requireIntern, async (req, res) => {
    try {
      const activeLog = await storage.getActiveTimeLog(req.session.internId!);
      if (!activeLog) {
        return res.status(404).json({ message: "No active time log" });
      }
      const log = await storage.endTimeLog(activeLog.id, new Date());
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to end time log" });
    }
  });

  // Intern create task
app.post("/api/intern/create-task", requireIntern, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      projectId, // ✅ ADD THIS
    } = req.body;

    const task = await storage.createInternTask(req.session.internId!, {
      title,
      description,
      projectId: projectId || null, // ✅ PASS IT
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

  // Intern submit task
  app.post("/api/intern/tasks/:id/submit", requireIntern, async (req, res) => {
  try {
    const { notes, status } = req.body;
    const taskId = req.params.id;
    const internId = req.session.internId!;

    /** 1. Validate status */
    const allowedStatuses = ["pending", "running", "completed", "cancelled"];
    const finalStatus = allowedStatuses.includes(status)
      ? status
      : "completed"; // default on submit

    /** 2. End active time log (if any) */
    const activeLog = await storage.getActiveTimeLogForTask(internId, taskId);
    let endedLog = null;

    if (activeLog) {
      // Save notes first
      if (notes?.trim()) {
        await storage.updateTimeLogNotes(activeLog.id, notes.trim());
      }

      endedLog = await storage.endTimeLog(activeLog.id, new Date());
    }

    /** 3. Prepare task update */
    const updateData: any = {
      submittedAt: new Date(),
      status: finalStatus,
    };

    // Close task only when truly finished
    if (finalStatus === "completed" || finalStatus === "cancelled") {
      updateData.closedAt = new Date();
    }

    /** 4. Update task */
    const task = await storage.updateTask(taskId, updateData);

    /** 5. Response */
    res.json({
      task,
      duration: endedLog?.duration ?? 0,
      message:
        finalStatus === "completed"
          ? "Task submitted and completed"
          : finalStatus === "cancelled"
          ? "Task cancelled"
          : "Task submitted for review",
    });
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ message: "Failed to submit task" });
  }
});

  // Project routes for interns - read-only access to admin-managed projects
  app.get("/api/intern/projects", requireIntern, async (_req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Password reset for interns
  app.post("/api/intern/reset-password", requireIntern, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const user = await storage.getInternUserByInternId(req.session.internId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      await storage.updateInternUserPassword(req.session.internId!, newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Forgot password - send reset link via email
  app.post("/api/intern/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const allInterns = await storage.getAllInterns();
      const intern = allInterns.find(i => i.email.toLowerCase() === email.toLowerCase());

      if (!intern) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If the email exists, a password reset email has been sent." });
      }

      // Check if user account exists
      const user = await storage.getInternUserByInternId(intern.id);

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      if (!user) {
        // Create user account if it doesn't exist
        await storage.createInternUser(intern.id, tempPassword);
        await storage.updateInternApproval(intern.id, 1);
      } else {
        // Update existing password
        await storage.updateInternPassword(intern.id, hashedPassword);
      }

      // Send email with temporary password
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail(email, intern.name, tempPassword);

      console.log("Password reset successful for:", email, "New password:", tempPassword);

      res.json({ 
        message: "If the email exists, a password reset email has been sent.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Notification routes
  app.get("/api/intern/notifications", requireIntern, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByIntern(req.session.internId!);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/intern/notifications/unread-count", requireIntern, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount(req.session.internId!);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/intern/notifications/:id/read", requireIntern, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get intern profile
  app.get("/api/intern/profile", requireIntern, async (req, res) => {
    try {
      console.log("Fetching profile for intern:", req.session.internId);
      
      if (!req.session.internId) {
        console.log("No internId in session");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const intern = await storage.getInternById(req.session.internId);
      if (!intern) {
        console.log("Intern not found for ID:", req.session.internId);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log("Profile found:", intern.name);
      res.json(intern);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update intern profile with image upload
  const profileUpload = multer({
    storage: storageConfig,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowedTypes = [".jpg", ".jpeg", ".png", ".gif"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, JPEG, PNG, and GIF files are allowed"));
      }
    },
  });

  app.put("/api/intern/profile", requireIntern, profileUpload.single("profileImage"), async (req, res) => {
    try {
      const updateData: any = {
        name: req.body.name,
        phone: req.body.phone,
        city: req.body.city,
        education: req.body.education,
        skills: req.body.skills,
        workExperience: req.body.workExperience,
        projects: req.body.projects,
        github: req.body.github,
        linkedin: req.body.linkedin,
      };

      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const intern = await storage.updateIntern(req.session.internId!, updateData);
      res.json(intern);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Contact Messages Routes
  app.post("/api/contact", async (req, res) => {
    try {
      const { contactMessageSchema } = await import("@shared/schema");
      const validation = contactMessageSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const message = await storage.createContactMessage(validation.data);

      // Send email notification to admin (non-blocking - don't fail if email fails)
      try {
        const { sendContactNotificationEmail } = await import("./email");
        await sendContactNotificationEmail(
          validation.data.firstName,
          validation.data.lastName,
          validation.data.email,
          validation.data.subject,
          validation.data.message
        );
      } catch (emailError) {
        console.log("Email notification skipped (SMTP not configured)");
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin Project Management Routes
  app.get("/api/admin/projects", requireAdmin, async (_req, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      res.json(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/admin/projects", requireAdmin, async (req, res) => {
    try {
      const { name, description, status, startDate, endDate, repositoryUrl, deployedUrl } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }
      const projectData: any = {
        name,
        description: description || null,
        status: status || "in-progress",
        repositoryUrl: repositoryUrl || null,
        deployedUrl: deployedUrl || null,
      };
      if (startDate) projectData.startDate = new Date(startDate);
      if (endDate) projectData.endDate = new Date(endDate);
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      const { name, description, status, startDate, endDate, repositoryUrl, deployedUrl } = req.body;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (repositoryUrl !== undefined) updateData.repositoryUrl = repositoryUrl;
      if (deployedUrl !== undefined) updateData.deployedUrl = deployedUrl;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

      const project = await storage.updateProject(req.params.id, updateData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.get("/api/admin/projects/:id/tasks", requireAdmin, async (req, res) => {
    try {
      const projectTasks = await storage.getTasksByProject(req.params.id);
      res.json(projectTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.post("/api/admin/projects/:id/tasks", requireAdmin, async (req, res) => {
    try {
      const { title, description, assignedTo, status, priority, startDate, dueDate } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Task title is required" });
      }

      const taskData: any = {
        title,
        description: description || null,
        status: status || "pending",
        priority: priority || "medium",
        createdBy: "admin",
        projectId: req.params.id,
        assignedTo: assignedTo || null,
      };
      if (startDate) taskData.startDate = new Date(startDate);
      if (dueDate) taskData.dueDate = new Date(dueDate);

      const task = await storage.createTask(taskData);

      // Create notification for assigned intern
      if (assignedTo) {
        await storage.createNotification({
          internId: assignedTo,
          type: "task_assigned",
          title: "New Task Assigned",
          message: `You have been assigned to task: ${title}`,
          relatedTaskId: task.id,
        });
      }

      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating project task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/admin/contact-messages", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put("/api/admin/contact-messages/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const message = await storage.updateContactMessageStatus(req.params.id, status);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message status" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ message: "Contact message deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

/* ================= CREATE EXAM ================= */

app.post("/api/exams", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description = null,
      duration_minutes,
      total_marks,
      start_time = null,
      end_time = null,
      is_published = false,
    } = req.body;

    if (!title || duration_minutes == null || total_marks == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      `
      INSERT INTO exams (
        title,
        description,
        duration_minutes,
        total_marks,
        start_time,
        end_time,
        is_published
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        title,
        description,
        Number(duration_minutes),
        Number(total_marks),
        start_time ? new Date(start_time).toISOString() : null,
        end_time ? new Date(end_time).toISOString() : null,
        is_published,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE EXAM ERROR:", err.message);
      res.status(500).json({
    message: "Failed to create exam",
    error: err.message,      // 👈 THIS LINE
    detail: err.detail,      // 👈 Postgres specific
    code: err.code           // 👈 PG error code
  });
  }
});



/* ================= GET ALL EXAMS ================= */

app.get("/api/exams", requireAdmin, async (_req, res) => {
  try {
    const exams = await storage.getAllExams();
    res.json(exams);
  } catch (error) {
    console.error("FETCH EXAMS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
});



/* ================= UPDATE EXAM ================= */

app.put("/api/exams/:id", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      duration_minutes,
      total_marks,
      start_time,
      end_time,
      is_published,
    } = req.body;

    const updateData = {
      title,
      description: description ?? null,
      duration_minutes,
      total_marks,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      is_published,
    };

    const exam = await storage.updateExam(req.params.id, updateData);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(exam);
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);
    res.status(500).json({ message: "Failed to update exam" });
  }
});



/* ================= DELETE EXAM ================= */

app.delete("/api/exams/:id", requireAdmin, async (req, res) => {
  try {
    await storage.deleteExam(req.params.id);
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);
    res.status(500).json({ message: "Failed to delete exam" });
  }
});



/* ================= PUBLISH EXAM ================= */

app.patch("/api/exams/:id/enable", requireAdmin, async (req, res) => {
  try {
    const exam = await storage.updateExam(req.params.id, {
      is_published: true,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({
      message: "Exam published successfully",
      exam,
    });
  } catch (error) {
    console.error("PUBLISH EXAM ERROR:", error);
    res.status(500).json({ message: "Failed to publish exam" });
  }
});



/* ================= UNPUBLISH EXAM ================= */

app.patch("/api/exams/:id/disable", requireAdmin, async (req, res) => {
  try {
    const exam = await storage.updateExam(req.params.id, {
      is_published: false,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({
      message: "Exam unpublished successfully",
      exam,
    });
  } catch (error) {
    console.error("UNPUBLISH EXAM ERROR:", error);
    res.status(500).json({ message: "Failed to unpublish exam" });
  }
});

/* ================= TRAINING MODULE ROUTES ================= */

/* Get all training weeks */
app.get("/api/training/weeks", requireAuth, async (req, res) => {
  try {
    const weeks = await db.select().from(trainingWeeks).orderBy(trainingWeeks.weekNumber);
    res.json(weeks);
  } catch (error) {
    console.error("GET WEEKS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch weeks" });
  }
});

/* Get topics for a specific week */
app.get("/api/training/weeks/:weekId/topics", requireAuth, async (req, res) => {
  try {
    const topics = await db
      .select()
      .from(trainingTopics)
      .where(eq(trainingTopics.weekId, req.params.weekId))
      .orderBy(trainingTopics.id);
    res.json(topics);
  } catch (error) {
    console.error("GET TOPICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch topics" });
  }
});

/* Get subtopics for a specific topic */
app.get("/api/training/topics/:topicId/subtopics", requireAuth, async (req, res) => {
  try {
    const subtopics = await db
      .select()
      .from(trainingSubtopics)
      .where(eq(trainingSubtopics.topicId, req.params.topicId))
      .orderBy(trainingSubtopics.id);
    res.json(subtopics);
  } catch (error) {
    console.error("GET SUBTOPICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch subtopics" });
  }
});

/* Get intern's training progress */
app.get("/api/training/progress/:internId", requireAuth, async (req, res) => {
  try {
    const progress = await db
      .select()
      .from(internTrainingProgress)
      .where(eq(internTrainingProgress.internId, req.params.internId));
    res.json(progress);
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

/* Submit progress for a week */
app.post("/api/training/progress/submit", requireAuth, async (req, res) => {
  try {
    const { internId, weekId, subtopicIds } = req.body;

    if (!internId || !weekId || !subtopicIds || subtopicIds.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Delete existing progress for this week
    await db
      .delete(internTrainingProgress)
      .where(
        and(
          eq(internTrainingProgress.internId, internId),
          eq(internTrainingProgress.weekId, weekId)
        )
      );

    // Insert new progress records
    const progressRecords = subtopicIds.map((subtopicId: string) => ({
      internId,
      weekId,
      subtopicId,
      isCompleted: true,
      completedAt: new Date(),
    }));

    await db.insert(internTrainingProgress).values(progressRecords);

    res.json({ message: "Progress submitted successfully" });
  } catch (error) {
    console.error("SUBMIT PROGRESS ERROR:", error);
    res.status(500).json({ message: "Failed to submit progress" });
  }
});

/* Get final submission status (all 4 weeks completed) */
app.get("/api/training/check-completion/:internId", requireAuth, async (req, res) => {
  try {
    const internId = req.params.internId;

    // Get all weeks
    const allWeeks = await db.select().from(trainingWeeks);

    // For each week, check if all subtopics are completed
    const completionStatus = await Promise.all(
      allWeeks.map(async (week) => {
        // Get all subtopics for this week
        const subtopics = await db
          .select()
          .from(trainingSubtopics)
          .innerJoin(trainingTopics, eq(trainingSubtopics.topicId, trainingTopics.id))
          .where(eq(trainingTopics.weekId, week.id));

        const subtopicIds = subtopics.map((s) => s.training_subtopics.id);

        if (subtopicIds.length === 0) {
          return { weekId: week.id, weekNumber: week.weekNumber, isCompleted: false };
        }

        // Check if all subtopics are completed for this intern
        const completedCount = await db
          .select()
          .from(internTrainingProgress)
          .where(
            and(
              eq(internTrainingProgress.internId, internId),
              eq(internTrainingProgress.weekId, week.id),
              inArray(internTrainingProgress.subtopicId, subtopicIds),
              eq(internTrainingProgress.isCompleted, true)
            )
          );

        return {
          weekId: week.id,
          weekNumber: week.weekNumber,
          isCompleted: completedCount.length === subtopicIds.length,
        };
      })
    );

    const allWeeksCompleted = completionStatus.every((w) => w.isCompleted);

    res.json({
      completionStatus,
      allWeeksCompleted,
    });
  } catch (error) {
    console.error("CHECK COMPLETION ERROR:", error);
    res.status(500).json({ message: "Failed to check completion" });
  }
});

/* Final submission - Generate certificate */
app.post("/api/training/final-submit", requireAuth, async (req, res) => {
  try {
    const { internId } = req.body;

    if (!internId) {
      return res.status(400).json({ message: "Missing internId" });
    }

    // Check if certificate already exists
    const existingCert = await db
      .select()
      .from(internCertificates)
      .where(eq(internCertificates.internId, internId))
      .limit(1);

    if (existingCert.length > 0) {
      return res.status(400).json({ message: "Certificate already generated" });
    }

    // Generate certificate number (format: CERT-YYYYMMDD-XXXXX)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificateNumber = `CERT-${dateStr}-${randomStr}`;

    // Create certificate record
    const certificate = await db
      .insert(internCertificates)
      .values({
        internId,
        certificateNumber,
        issuedDate: new Date(),
      })
      .returning();

    res.json({
      message: "Certificate generated successfully",
      certificate: certificate[0],
    });
  } catch (error) {
    console.error("FINAL SUBMIT ERROR:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

/* Get certificate for an intern */
app.get("/api/training/certificate/:internId", requireAuth, async (req, res) => {
  try {
    const certificate = await db
      .select()
      .from(internCertificates)
      .where(eq(internCertificates.internId, req.params.internId))
      .limit(1);

    if (certificate.length === 0) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate[0]);
  } catch (error) {
    console.error("GET CERTIFICATE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch certificate" });
  }
});

  return httpServer;
}
