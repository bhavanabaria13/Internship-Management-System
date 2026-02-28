import { pgTable, text, timestamp, uuid, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  durationMinutes: integer("duration_minutes").notNull(),
  totalMarks: integer("total_marks").notNull(),

  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),

  isPublished: boolean("is_published").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});


export const interns = pgTable("interns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  workExperience: text("work_experience"),
  education: text("education").notNull(),
  city: text("city").notNull(),
  github: text("github"),
  linkedin: text("linkedin"),
  skills: text("skills").notNull(),
  projects: text("projects"),
  cvFilename: text("cv_filename"),
  cvOriginalName: text("cv_original_name"),
  profileImage: text("profile_image"),
  appliedDate: timestamp("applied_date").defaultNow(),
});

export const insertInternSchema = createInsertSchema(interns);
export const selectInternSchema = createSelectSchema(interns);

export type Intern = typeof interns.$inferSelect;
export type InsertIntern = typeof interns.$inferInsert;

export const internSchema = createInsertSchema(interns).omit({
  id: true,
  appliedDate: true,
});

export const adminSchema = pgTable("admin", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const weeklyUpdatesSchema = pgTable("weekly_updates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  internId: uuid("intern_id").notNull().references(() => interns.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  programCourseName: text("program_course_name").notNull(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  learningTopics: text("learning_topics"),
  tasksCompleted: text("tasks_completed"),
  workOutput: text("work_output"),
  githubRepoLink: text("github_repo_link"),
  deployedUrl: text("deployed_url"),
  taskCompletionStatus: text("task_completion_status"),
  selfRating: integer("self_rating"),
  timeSpent: text("time_spent"),
  challengesFaced: text("challenges_faced"),
  solutionsAttempted: text("solutions_attempted"),
  keyLearnings: text("key_learnings"),
  performanceScore: integer("performance_score"),
  mentorFeedback: text("mentor_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WeeklyUpdate = typeof weeklyUpdatesSchema.$inferSelect;
export type InsertWeeklyUpdate = typeof weeklyUpdatesSchema.$inferInsert;

export const weeklyUpdateSchema = z.object({
  internId: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  programCourseName: z.string().min(1, "Program/Course name is required"),
  weekNumber: z.number().min(1).max(53),
  year: z.number().min(2000),
  reportingPeriod: z.string().min(1, "Reporting period is required"),
  learningTopics: z.string().optional(),
  tasksCompleted: z.string().optional(),
  workOutput: z.string().optional(),
  githubRepoLink: z.string().optional(),
  deployedUrl: z.string().optional(),
  taskCompletionStatus: z.string().optional(),
  selfRating: z.number().min(1).max(5).optional(),
  timeSpent: z.string().optional(),
  challengesFaced: z.string().optional(),
  solutionsAttempted: z.string().optional(),
  keyLearnings: z.string().optional(),
  performanceScore: z.number().min(1).max(5).optional(),
  mentorFeedback: z.string().optional(),
});


export const internUsers = pgTable("intern_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  internId: uuid("intern_id").notNull().references(() => interns.id, { onDelete: "cascade" }).unique(),
  password: text("password").notNull(),
  isApproved: integer("is_approved").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InternUser = typeof internUsers.$inferSelect;
export type InsertInternUser = typeof internUsers.$inferInsert;

// Projects - admin managed
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in-progress"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  repositoryUrl: text("repository_url"),
  deployedUrl: text("deployed_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["in-progress", "completed", "on-hold"]).default("in-progress"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  repositoryUrl: z.string().optional(),
  deployedUrl: z.string().optional(),
});

// Tasks - can be linked to projects and assigned to interns
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: uuid("assigned_to").references(() => interns.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"),
  priority: text("priority").default("medium"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdBy: text("created_by").notNull(),
  createdByIntern: uuid("created_by_intern").references(() => interns.id, { onDelete: "set null" }),
  submittedAt: timestamp("submitted_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(["pending", "running", "completed", "cancelled"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

// Time logs for tasks and general work
export const timeLogs = pgTable("time_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  internId: uuid("intern_id").notNull().references(() => interns.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
  logType: text("log_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertTimeLog = typeof timeLogs.$inferInsert;

export const timeLogSchema = z.object({
  internId: z.string(),
  taskId: z.string().optional(),
  logType: z.enum(["task", "login", "break"]),
  startTime: z.string(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  internId: uuid("intern_id").notNull().references(() => interns.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read").default(0).notNull(),
  relatedTaskId: uuid("related_task_id").references(() => tasks.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export const contactMessageSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Intern login schema
export const internLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;
