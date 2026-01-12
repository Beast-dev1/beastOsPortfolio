import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Email from '@/models/Email';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    await Email.deleteMany({ _id: { $in: body } });

    return NextResponse.json('emails deleted successfully', { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


