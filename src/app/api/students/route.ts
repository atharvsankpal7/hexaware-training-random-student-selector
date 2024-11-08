import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/database/connectToDb";
import mongoose from "mongoose";

// Define Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create Student model (only if it doesn't exist)
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export async function GET() {
  try {
    await connectToMongoDB();
    const students = await Student.find({});
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students", message: error },

      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToMongoDB();
    const { students: newStudents } = await request.json();

    // Insert multiple students
    await Student.insertMany(newStudents);

    return NextResponse.json({ message: "Students saved successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to save students" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToMongoDB();
    const { name } = await request.json();

    // Delete the student with the given name
    await Student.deleteOne({ name: name });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
