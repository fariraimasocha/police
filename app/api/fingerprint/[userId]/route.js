import connectDB from "@/utils/dbConnect";
import Fingerprint from "@/models/Fingerprint";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { userId } = await params;
    const fingerprint = await Fingerprint.findOne({ userId });
    if (!fingerprint) {
      return NextResponse.json(
        { success: false, error: "Fingerprint not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, data: fingerprint },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
