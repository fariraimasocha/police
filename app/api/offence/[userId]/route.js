import Offence from "@/models/Offence";
import connectDB from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { userId } = await params;
    const offences = await Offence.find({ userId });
    return NextResponse.json(
      { success: true, data: offences },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
