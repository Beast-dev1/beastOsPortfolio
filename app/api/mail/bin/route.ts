import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Email from '@/models/Email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    await Email.updateMany(
      { _id: { $in: body } },
      { $set: { bin: true, starred: false, type: '' } }
    );

    return NextResponse.json('emails moved to bin successfully', { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


