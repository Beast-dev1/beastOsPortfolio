import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Email from '@/models/Email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const email = new Email(body);
    await email.save();

    return NextResponse.json('email saved successfully', { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


