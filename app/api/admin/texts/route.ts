import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const texts = await prisma.text.findMany({
      orderBy: {
        dateUploaded: "desc",
      },
    });

    return NextResponse.json(texts);
  } catch (error) {
    console.error("Error fetching texts:", error);
    return NextResponse.json(
      { error: "Failed to fetch texts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { referenceID, text, correctedText } = body;

    if (!referenceID || !text || !correctedText) {
      return NextResponse.json(
        { error: "Reference ID, text, and corrected text are required" },
        { status: 400 }
      );
    }

    // Check if referenceID already exists
    const existingText = await prisma.text.findUnique({
      where: { referenceID },
    });

    if (existingText) {
      return NextResponse.json(
        { error: "A text with this reference ID already exists" },
        { status: 400 }
      );
    }

    const newText = await prisma.text.create({
      data: {
        referenceID,
        text,
        correctedText,
      },
    });

    return NextResponse.json(newText, { status: 201 });
  } catch (error) {
    console.error("Error creating text:", error);
    return NextResponse.json(
      { error: "Failed to create text" },
      { status: 500 }
    );
  }
}
