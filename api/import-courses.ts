import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { courses, lessons, roboticsActivities } from '../shared/schema';
import type { InsertCourse, InsertLesson, InsertRoboticsActivity } from '../shared/schema';

// This creates a Vercel API endpoint at /api/import-courses
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Set up database connection
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    neonConfig.webSocketConstructor = require('ws');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });
    
    // Read course material from uploaded JSON
    let courseData;
    if (req.body && Object.keys(req.body).length > 0) {
      courseData = req.body;
    } else {
      // Fallback to reading from file system
      const coursePath = join(process.cwd(), 'course-material.json');
      courseData = JSON.parse(readFileSync(coursePath, 'utf8'));
    }
    
    const importResults = {
      coursesImported: 0,
      lessonsImported: 0,
      activitiesImported: 0
    };
    
    // Import courses with lessons
    if (courseData.courses) {
      for (const courseItem of courseData.courses) {
        const { lessons: courseLessons, ...course } = courseItem;
        
        // Insert course
        const [insertedCourse] = await db
          .insert(courses)
          .values(course as InsertCourse)
          .returning();
        
        importResults.coursesImported++;
        
        // Insert lessons for this course
        if (courseLessons && courseLessons.length > 0) {
          for (const lesson of courseLessons) {
            await db.insert(lessons).values({
              ...lesson,
              courseId: insertedCourse.id
            } as InsertLesson);
            
            importResults.lessonsImported++;
          }
        }
      }
    }
    
    // Import robotics activities
    if (courseData.roboticsActivities) {
      for (const activity of courseData.roboticsActivities) {
        await db
          .insert(roboticsActivities)
          .values(activity as InsertRoboticsActivity);
        
        importResults.activitiesImported++;
      }
    }
    
    res.json({
      success: true,
      message: 'Course material imported successfully',
      results: importResults
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      error: 'Failed to import course material',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}