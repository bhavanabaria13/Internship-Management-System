import { db } from "./db";
import {
  interns,
  type Intern,
  type InsertIntern,
  weeklyUpdatesSchema,
  type WeeklyUpdate,
  type InsertWeeklyUpdate,
  internUsers,
  type InternUser,
  type InsertInternUser,
  tasks,
  type Task,
  type InsertTask,
  timeLogs,
  type TimeLog,
  type InsertTimeLog,
  projects,
  type Project,
  type InsertProject,
  notifications,
  contactMessages,
  exams,   
} from "@shared/schema";
import { eq, desc, and, gte, lte, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export interface IStorage {
  createIntern(data: Omit<InsertIntern, "id" | "appliedDate">): Promise<Intern>;
  getAllInterns(): Promise<Intern[]>;
  getInternById(id: string): Promise<Intern | null>;
  getInternByEmail(email: string): Promise<Intern | null>;
  deleteIntern(id: string): Promise<boolean>;

  // Weekly Updates
  createWeeklyUpdate(data: Omit<InsertWeeklyUpdate, 'id'>): Promise<WeeklyUpdate>;
  getWeeklyUpdatesByIntern(internId: string): Promise<WeeklyUpdate[]>;
  getAllWeeklyUpdates(): Promise<WeeklyUpdate[]>;
  getWeeklyUpdate(id: string): Promise<WeeklyUpdate | null>;
  updateWeeklyUpdate(id: string, data: Partial<InsertWeeklyUpdate>): Promise<WeeklyUpdate | null>;
  deleteWeeklyUpdate(id: string): Promise<void>;
  getWeeklyUpdatesByWeek(weekNumber: number, year: number): Promise<WeeklyUpdate[]>;

  // Intern Users
  createInternUser(internId: string, password: string): Promise<InternUser>;
  getInternUserByInternId(internId: string): Promise<InternUser | null>;
  getInternUserByEmail(email: string): Promise<(InternUser & Intern) | null>;
  updateInternApproval(internId: string, isApproved: number): Promise<void>;
  updateInternPassword(internId: string, hashedPassword: string): Promise<void>;
  getAllPendingInterns(): Promise<Intern[]>;
  getAllInternsWithStatus(): Promise<any[]>;
  updateIntern(id: string, data: Partial<InsertInsertIntern>): Promise<Intern | null>;

  // Tasks
  createTask(data: Omit<InsertTask, "id">): Promise<Task>;
  createInternTask(internId: string, taskData: any): Promise<Task>;
  updateTaskStatus(taskId: string, status: string, extraFields?: any): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByIntern(internId: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | null>;
  deleteTask(id: string): Promise<void>;

  // Time Logs
  createTimeLog(data: Omit<InsertTimeLog, "id">): Promise<TimeLog>;
  getTimeLogsByIntern(internId: string): Promise<TimeLog[]>;
  getAllTimeLogs(): Promise<TimeLog[]>;
  getActiveTimeLog(internId: string): Promise<TimeLog | null>;
  endTimeLog(id: string, endTime: Date): Promise<TimeLog | null>;
  getTimeLogsByDateRange(internId: string, startDate: Date, endDate: Date): Promise<TimeLog[]>;

  // Projects (admin-managed)
  createProject(projectData: Partial<InsertProject>): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
  getTasksByProject(projectId: string): Promise<Task[]>;

  // Password Reset
  updateInternUserPassword(internId: string, newPassword: string): Promise<void>;

  // Notifications
  createNotification(data: { internId: string; type: string; title: string; message: string; relatedTaskId?: string }): Promise<any>;
  getNotificationsByIntern(internId: string): Promise<any[]>;
  markNotificationAsRead(id: string): Promise<void>;
  getUnreadNotificationsCount(internId: string): Promise<number>;

  // Time Log helpers
  getActiveTimeLogForTask(internId: string, taskId: string): Promise<TimeLog | null>;
  updateTimeLogNotes(logId: string, notes: string): Promise<void>;

  // Contact Messages
  createContactMessage(data: any): Promise<any>;
  getAllContactMessages(): Promise<any[]>;
  updateContactMessageStatus(id: string, status: string): Promise<any>;
  deleteContactMessage(id: string): Promise<void>;
  
  // Exams
createExam(data: any): Promise<any>;
getAllExams(): Promise<any[]>;
getExamById(id: string): Promise<any | null>;
updateExam(id: string, data: any): Promise<any | null>;
deleteExam(id: string): Promise<void>;

}

class PostgresStorage implements IStorage {
	/* ================= EXAMS ================= */

async getAllExams(): Promise<any[]> {
  try {
    return await db
      .select()
      .from(exams)
      .orderBy(desc(exams.createdAt));
  } catch (err) {
    console.error("STORAGE getAllExams ERROR:", err);
    throw err;
  }
}

async updateExam(id: string, data: any): Promise<any | null> {
  try {
    const [updated] = await db
      .update(exams)
      .set(data)
      .where(eq(exams.id, id))
      .returning();

    return updated || null;
  } catch (err) {
    console.error("STORAGE updateExam ERROR:", err);
    throw err;
  }
}

async deleteExam(id: string): Promise<void> {
  try {
    await db.delete(exams).where(eq(exams.id, id));
  } catch (err) {
    console.error("STORAGE deleteExam ERROR:", err);
    throw err;
  }
}

  async createIntern(data: Omit<InsertIntern, "id" | "appliedDate">): Promise<Intern> {
    
	try {
	 const query = db.insert(interns).values(data).returning();

const { sql, params } = query.toSQL();
console.log("SQL:", sql);
console.log("PARAMS:", params);

const [createdIntern] = await query;
return createdIntern;

	} catch (e) {
	  console.error("DB INSERT ERROR:", e);
	  throw e;
	}
  }

  async getAllInterns(): Promise<Intern[]> {
    return await db.select().from(interns).orderBy(desc(interns.appliedDate));
  }

  async getInternById(id: string): Promise<Intern | null> {
    const [intern] = await db.select().from(interns).where(eq(interns.id, id));
    return intern || null;
  }

  async getInternByEmail(email: string): Promise<Intern | null> {
    const [intern] = await db.select().from(interns).where(eq(interns.email, email));
    return intern || null;
  }

  async deleteIntern(id: string): Promise<boolean> {
    // Delete intern user account first
    await db.delete(internUsers).where(eq(internUsers.internId, id));
    // Then delete intern
    const result = await db.delete(interns).where(eq(interns.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Weekly Updates
  async createWeeklyUpdate(data: Omit<InsertWeeklyUpdate, 'id'>): Promise<WeeklyUpdate> {
    const id = crypto.randomUUID();
    const [update] = await db.insert(weeklyUpdatesSchema).values({ id, ...data }).returning();
    return update;
  }

  async getWeeklyUpdatesByIntern(internId: string): Promise<WeeklyUpdate[]> {
    return await db
      .select()
      .from(weeklyUpdatesSchema)
      .where(eq(weeklyUpdatesSchema.internId, internId))
      .orderBy(desc(weeklyUpdatesSchema.year), desc(weeklyUpdatesSchema.weekNumber));
  }

  async getAllWeeklyUpdates(): Promise<WeeklyUpdate[]> {
    return await db
      .select()
      .from(weeklyUpdatesSchema)
      .orderBy(desc(weeklyUpdatesSchema.year), desc(weeklyUpdatesSchema.weekNumber));
  }

  async getWeeklyUpdate(id: string): Promise<WeeklyUpdate | null> {
    const [update] = await db
      .select()
      .from(weeklyUpdatesSchema)
      .where(eq(weeklyUpdatesSchema.id, id));
    return update || null;
  }

  async updateWeeklyUpdate(id: string, data: Partial<InsertWeeklyUpdate>): Promise<WeeklyUpdate | null> {
    const [update] = await db
      .update(weeklyUpdatesSchema)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(weeklyUpdatesSchema.id, id))
      .returning();
    return update || null;
  }


  async deleteWeeklyUpdate(id: string): Promise<void> {
    await db.delete(weeklyUpdatesSchema).where(eq(weeklyUpdatesSchema.id, id));
  }

  async getWeeklyUpdatesByWeek(weekNumber: number, year: number): Promise<WeeklyUpdate[]> {
    return await db
      .select()
      .from(weeklyUpdatesSchema)
      .where(
        and(
          eq(weeklyUpdatesSchema.weekNumber, weekNumber),
          eq(weeklyUpdatesSchema.year, year)
        )
      );
  }

  async hasWeeklyUpdate(internId: string, weekNumber: number, year: number): Promise<boolean> {
    const updates = await db
      .select()
      .from(weeklyUpdatesSchema)
      .where(
        and(
          eq(weeklyUpdatesSchema.internId, internId),
          eq(weeklyUpdatesSchema.weekNumber, weekNumber),
          eq(weeklyUpdatesSchema.year, year)
        )
      );
    return updates.length > 0;
  }

  /*async getActiveTimeLogForTask(internId: string, taskId: string): Promise<TimeLog | null> {
    const [log] = await db
      .select()
      .from(timeLogs)
      .where(
        and(
          eq(timeLogs.internId, internId),
          eq(timeLogs.taskId, taskId),
          isNull(timeLogs.endTime)
        )
      )
      .orderBy(desc(timeLogs.startTime))
      .limit(1);
    return log || null;
  }*/
  async getActiveTimeLogForTask(
  internId: string,
  taskId: string
): Promise<TimeLog | null> {
  const [log] = await db
    .select()
    .from(timeLogs)
    .where(
      and(
        eq(timeLogs.internId, internId),
        eq(timeLogs.taskId, taskId),
        isNull(timeLogs.endTime) // MUST be NULL for active log
      )
    )
    .orderBy(desc(timeLogs.startTime)) // latest first (safety)
    .limit(1);

  return log ?? null;
}


  async updateTimeLogNotes(logId: string, notes: string): Promise<void> {
    await db
      .update(timeLogs)
      .set({ notes })
      .where(eq(timeLogs.id, logId));
  }

  // Intern Users
  async createInternUser(internId: string, password: string): Promise<InternUser> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(internUsers).values({ internId, password: hashedPassword }).returning();
    return user;
  }

  async getInternUserByInternId(internId: string): Promise<InternUser | null> {
    const [user] = await db.select().from(internUsers).where(eq(internUsers.internId, internId));
    return user || null;
  }

  async getInternUserByEmail(email: string): Promise<(InternUser & Intern) | null> {
    const result = await db
      .select()
      .from(internUsers)
      .innerJoin(interns, eq(internUsers.internId, interns.id))
      .where(eq(interns.email, email));

    if (result.length === 0) return null;
    return { ...result[0].intern_users, ...result[0].interns };
  }

  async updateInternApproval(internId: string, isApproved: number): Promise<void> {
    await db.update(internUsers).set({ isApproved }).where(eq(internUsers.internId, internId));
  }

  async updateInternPassword(internId: string, hashedPassword: string): Promise<void> {
    await db.update(internUsers).set({ password: hashedPassword }).where(eq(internUsers.internId, internId));
  }

  async getAllPendingInterns(): Promise<Intern[]> {
    const result = await db
      .select()
      .from(interns)
      .leftJoin(internUsers, eq(interns.id, internUsers.internId))
      .where(eq(internUsers.isApproved, 0));
    return result.map(r => r.interns);
  }

  async getAllInternsWithStatus(): Promise<any[]> {
    const result = await db
      .select({
        id: interns.id,
        name: interns.name,
        email: interns.email,
        phone: interns.phone,
        workExperience: interns.workExperience,
        education: interns.education,
        city: interns.city,
        github: interns.github,
        linkedin: interns.linkedin,
        skills: interns.skills,
        projects: interns.projects,
        cvFilename: interns.cvFilename,
        cvOriginalName: interns.cvOriginalName,
        profileImage: interns.profileImage,
        appliedDate: interns.appliedDate,
        approvalStatus: internUsers.isApproved,
      })
      .from(interns)
      .leftJoin(internUsers, eq(interns.id, internUsers.internId))
      .orderBy(desc(interns.appliedDate));

    // Set approvalStatus to 0 (pending) for interns without user accounts
    return result.map(intern => ({
      ...intern,
      approvalStatus: intern.approvalStatus ?? 0
    }));
  }

  async updateIntern(id: string, data: Partial<InsertIntern>): Promise<Intern | null> {
    const [updated] = await db.update(interns).set(data).where(eq(interns.id, id)).returning();
    return updated || null;
  }

  // Tasks
  async createTask(data: Omit<InsertTask, "id">): Promise<Task> {
    try {
      const id = randomUUID();
      const now = new Date();
      await db.insert(tasks).values({ id, ...data, createdAt: now, updatedAt: now }).returning();
      return this.getTaskById(id) as Promise<Task>;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async createInternTask(internId: string, taskData: any): Promise<Task> {
    const taskId = randomUUID();
    const now = new Date();

    const task = await db.insert(tasks).values({
      id: taskId,
      title: taskData.title,
      description: taskData.description || null,
      status: "pending",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      startDate: taskData.startDate ? new Date(taskData.startDate) : null,
      createdBy: "intern",
      createdByIntern: internId,
      assignedTo: internId,
      projectId: taskData.projectId || null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return task[0];
  }

  async updateTaskStatus(taskId: string, status: string, extraFields?: any): Promise<Task | undefined> {
    const updateData: any = { status, updatedAt: new Date() };

    if (status === "completed" && !extraFields?.closedAt) {
      updateData.closedAt = new Date();
    }

    if (extraFields?.submittedAt) {
      updateData.submittedAt = extraFields.submittedAt;
    }

    const [updated] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();
    return updated;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByIntern(internId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, internId)).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: string): Promise<Task | null> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || null;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | null> {
    try {
      const [updated] = await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
      return updated || null;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Time Logs
  async createTimeLog(data: Omit<InsertTimeLog, "id">): Promise<TimeLog> {
    const [log] = await db.insert(timeLogs).values(data).returning();
    return log;
  }

  async getTimeLogsByIntern(internId: string): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).where(eq(timeLogs.internId, internId)).orderBy(desc(timeLogs.startTime));
  }

  async getAllTimeLogs(): Promise<TimeLog[]> {
    return await db.select().from(timeLogs).orderBy(desc(timeLogs.startTime));
  }

  async getActiveTimeLog(internId: string): Promise<TimeLog | null> {
    const [log] = await db
      .select()
      .from(timeLogs)
      .where(and(eq(timeLogs.internId, internId), isNull(timeLogs.endTime)))
      .orderBy(desc(timeLogs.startTime));
    return log || null;
  }

  async endTimeLog(id: string, endTime: Date): Promise<TimeLog | null> {
    const [log] = await db.select().from(timeLogs).where(eq(timeLogs.id, id));
    if (!log || log.endTime) return null;

    const duration = Math.floor((endTime.getTime() - new Date(log.startTime).getTime()) / 60000);
    const [updated] = await db.update(timeLogs).set({ endTime, duration }).where(eq(timeLogs.id, id)).returning();
    return updated || null;
  }

  async getTimeLogsByDateRange(internId: string, startDate: Date, endDate: Date): Promise<TimeLog[]> {
    return await db
      .select()
      .from(timeLogs)
      .where(
        and(
          eq(timeLogs.internId, internId),
          gte(timeLogs.startTime, startDate),
          lte(timeLogs.startTime, endDate)
        )
      )
      .orderBy(desc(timeLogs.startTime));
  }

  // Projects (admin-managed)
  async createProject(projectData: Partial<InsertProject>): Promise<Project> {
    const [newProject] = await db.insert(projects).values({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newProject;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || null;
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project | null> {
    const [updated] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    // First unlink tasks from this project
    await db.update(tasks).set({ projectId: null }).where(eq(tasks.projectId, id));
    // Then delete the project
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt));
  }

  // Password reset
  async updateInternUserPassword(internId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(internUsers)
      .set({ password: hashedPassword })
      .where(eq(internUsers.internId, internId));
  }

  // Notifications
  async createNotification(data: { internId: string; type: string; title: string; message: string; relatedTaskId?: string }): Promise<any> {
    const [notification] = await db
      .insert(notifications)
      .values({
        id: randomUUID(),
        ...data,
        read: 0,
        createdAt: new Date(),
      })
      .returning();
    return notification;
  }

  async getNotificationsByIntern(internId: string): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.internId, internId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationsCount(internId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.internId, internId),
          eq(notifications.read, 0)
        )
      );
    return result.length;
  }

  // Contact Messages
  async createContactMessage(data: any) {
    const [message] = await db.insert(contactMessages).values({
      id: crypto.randomUUID(),
      ...data,
    }).returning();
    return message;
  }

  async getAllContactMessages() {
  //  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
	 return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
  }

  async updateContactMessageStatus(id: string, status: string) {
    const [message] = await db.update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  async deleteContactMessage(id: string) {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
}


export const storage = new PostgresStorage();