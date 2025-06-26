import { NextResponse } from "next/server";
import Offence from "@/models/Offence";
import connectDB from "@/utils/dbConnect";

export async function POST(req) {
  await connectDB();
  try {
    const { userId, offenceDetails, offenceDate } = await req.json();

    const offence = await Offence.create({
      userId,
      offenceDetails,
      offenceDate,
    });

    return NextResponse.json({ success: true, data: offence }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
