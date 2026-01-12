import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Email from '@/models/Email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    await Email.updateOne(
      { _id: body.id },
      { $set: { starred: body.value } }
    );

    return NextResponse.json('Value is updated', { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


