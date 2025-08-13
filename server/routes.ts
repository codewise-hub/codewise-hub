import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { db } from './db'; // ✅ Neon-safe DB connection
import {
  insertUserSchema,
  insertCourseSchema,
  insertLessonSchema,
  insertRoboticsActivitySchema,
  users,
  courses,
  lessons,
  roboticsActivities,
} from '@shared/schema';
import { registerImportRoutes } from './routes-import';
import { eq } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, req.params.id));
      if (!user.length) return res.status(404).json({ error: 'User not found' });
      res.json(user[0]);
    } catch (error) {
      console.error('❌ /api/users/:id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const inserted = await db.insert(users).values(userData).returning();
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('❌ /api/users POST error:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  // Courses
  app.get('/api/courses', async (req, res) => {
    try {
      const { ageGroup } = req.query;
      const data =
        ageGroup && typeof ageGroup === 'string'
          ? await db.select().from(courses).where(eq(courses.ageGroup, ageGroup))
          : await db.select().from(courses);
      res.json(data);
    } catch (error) {
      console.error('❌ /api/courses error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/courses', async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const inserted = await db.insert(courses).values(courseData).returning();
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('❌ /api/courses POST error:', error);
      res.status(400).json({ error: 'Invalid course data' });
    }
  });

  // Lessons
  app.get('/api/courses/:courseId/lessons', async (req, res) => {
    try {
      const data = await db.select().from(lessons).where(eq(lessons.courseId, req.params.courseId));
      res.json(data);
    } catch (error) {
      console.error('❌ /api/courses/:courseId/lessons error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/lessons', async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const inserted = await db.insert(lessons).values(lessonData).returning();
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('❌ /api/lessons POST error:', error);
      res.status(400).json({ error: 'Invalid lesson data' });
    }
  });

  // Robotics Activities
  app.get('/api/robotics-activities', async (req, res) => {
    try {
      const { ageGroup } = req.query;
      const data =
        ageGroup && typeof ageGroup === 'string'
          ? await db.select().from(roboticsActivities).where(eq(roboticsActivities.ageGroup, ageGroup))
          : await db.select().from(roboticsActivities);
      res.json(data);
    } catch (error) {
      console.error('❌ /api/robotics-activities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/robotics-activities', async (req, res) => {
    try {
      const activityData = insertRoboticsActivitySchema.parse(req.body);
      const inserted = await db.insert(roboticsActivities).values(activityData).returning();
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('❌ /api/robotics-activities POST error:', error);
      res.status(400).json({ error: 'Invalid robotics activity data' });
    }
  });

  // Register import routes for production deployment
  registerImportRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
