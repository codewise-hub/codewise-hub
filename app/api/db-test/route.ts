import { NextResponse } from 'next/server';
import { db } from '../../../server/db';

export async function GET() {
  try {
    const result = await db.execute('SELECT NOW()');
    return NextResponse.json({ connected: true, time: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { connected: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
