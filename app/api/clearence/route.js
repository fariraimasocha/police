import { NextResponse } from "next/server";
import connectDB from "@/utils/dbConnect";
import Clearence from "@/models/Clearence";

export async function POST(req) {
  await connectDB();

  try {
    const { userId, fullName, imageUrl, idNumber, description } =
      await req.json();

    const clearence = await Clearence.create({
      userId,
      fullName,
      idNumber,
      imageUrl,
      description,
    });
    return NextResponse.json(
      { message: "Clearence created successfully", clearence },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
