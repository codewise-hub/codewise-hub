import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await db.execute('SELECT NOW()');
    res.status(200).json({ connected: true, time: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ connected: false, error: (error as Error).message });
  }
}
