import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Email from '@/models/Email';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    await connectDB();
    const type = params.type;

    let emails;

    if (type === 'starred') {
      emails = await Email.find({ starred: true, bin: false });
    } else if (type === 'bin') {
      emails = await Email.find({ bin: true });
    } else if (type === 'allmail') {
      emails = await Email.find({});
    } else if (type === 'inbox') {
      emails = [];
    } else {
      emails = await Email.find({ type: type });
    }

    return NextResponse.json(emails, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


