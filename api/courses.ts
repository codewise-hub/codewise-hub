import { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../server/db";
import { courses } from "../shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { ageGroup } = req.query;
      
      let query = db.select()
        .from(courses)
        .where(eq(courses.isActive, true));

      if (ageGroup && typeof ageGroup === 'string') {
        query = query.where(eq(courses.ageGroup, ageGroup));
      }

      const courseList = await query;
      return res.status(200).json(courseList);
    }

    if (req.method === 'POST') {
      const { title, description, ageGroup, difficulty, category, imageUrl, estimatedHours, teacherId } = req.body;
      
      const newCourse = await db.insert(courses).values({
        title,
        description,
        ageGroup,
        difficulty,
        category,
        imageUrl,
        estimatedHours,
        teacherId
      }).returning();

      return res.status(201).json(newCourse[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Courses API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}