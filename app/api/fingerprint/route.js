import connectDB from "@/utils/dbConnect";
import Fingerprint from "@/models/Fingerprint";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  try {
    const { userId, fullName, idNumber, imageUrl, imageSize, imageName } =
      await req.json();

    const fingerprint = await Fingerprint.create({
      userId,
      fullName,
      idNumber,
      imageUrl,
      imageSize,
      imageName,
    });

    return NextResponse.json(
      { success: true, data: fingerprint },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
