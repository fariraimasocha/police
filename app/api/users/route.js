import User from "@/models/User";
import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";

export async function GET(req) {
  await connectDB();

  try {
    const users = await User.find().sort({ timestamp: -1 });
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
