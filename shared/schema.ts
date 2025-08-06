import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'student', 'teacher', 'parent'
  ageGroup: text("age_group"), // '6-11', '12-17' for students
  childName: text("child_name"), // for parents
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  ageGroup: text("age_group").notNull(),
  difficulty: text("difficulty"), // 'beginner', 'intermediate', 'advanced'
  category: text("category"), // 'programming', 'robotics', 'web-development'
  imageUrl: text("image_url"),
  estimatedHours: integer("estimated_hours").default(10),
  teacherId: varchar("teacher_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // JSON string for rich content
  orderIndex: integer("order_index").notNull(),
  type: text("type"), // 'video', 'interactive', 'quiz', 'project'
  estimatedMinutes: integer("estimated_minutes").default(30),
  videoUrl: text("video_url"),
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roboticsActivities = pgTable("robotics_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type"), // 'puzzle', 'maze', 'challenge'
  difficulty: text("difficulty"), // 'easy', 'medium', 'hard'
  ageGroup: text("age_group").notNull(),
  instructions: text("instructions"), // JSON string
  solution: text("solution"), // JSON string
  estimatedMinutes: integer("estimated_minutes").default(15),
  points: integer("points").default(100),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  lessonsCompleted: integer("lessons_completed").default(0),
  projectsCompleted: integer("projects_completed").default(0),
  totalScore: integer("total_score").default(0),
  level: integer("level").default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code"),
  projectType: text("project_type"), // 'blockly', 'javascript', 'microbit'
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  badgeType: text("badge_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  firebaseUid: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertRoboticsActivitySchema = createInsertSchema(roboticsActivities).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type RoboticsActivity = typeof roboticsActivities.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertRoboticsActivity = z.infer<typeof insertRoboticsActivitySchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
