import { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../server/db";
import { packages } from "../shared/schema";
import { eq, and } from "drizzle-orm";

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
      // Get all active packages
      const allPackages = await db.select()
        .from(packages)
        .where(eq(packages.isActive, true));
      
      return res.status(200).json(allPackages);
    }

    if (req.method === 'POST') {
      // Create new package (admin only)
      const { name, description, price, duration, features, packageType, maxStudents } = req.body;
      
      const newPackage = await db.insert(packages).values({
        name,
        description,
        price: price.toString(),
        duration,
        features: JSON.stringify(features),
        packageType,
        maxStudents
      }).returning();

      return res.status(201).json(newPackage[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Packages API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}