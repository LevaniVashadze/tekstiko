import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { referenceID, text, correctedText } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Text ID is required" },
        { status: 400 }
      );
    }

    if (!referenceID || !text || !correctedText) {
      return NextResponse.json(
        { error: "Reference ID, text, and corrected text are required" },
        { status: 400 }
      );
    }

    // Check if text exists
    const existingText = await prisma.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 });
    }

    // Check if referenceID is being changed and if it conflicts with another text
    if (referenceID !== existingText.referenceID) {
      const conflictingText = await prisma.text.findUnique({
        where: { referenceID },
      });

      if (conflictingText) {
        return NextResponse.json(
          { error: "A text with this reference ID already exists" },
          { status: 400 }
        );
      }
    }

    // Update the text
    const updatedText = await prisma.text.update({
      where: { id },
      data: {
        referenceID,
        text,
        correctedText,
      },
    });

    return NextResponse.json(updatedText);
  } catch (error) {
    console.error("Error updating text:", error);
    return NextResponse.json(
      { error: "Failed to update text" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Text ID is required" },
        { status: 400 }
      );
    }

    // Check if text exists
    const existingText = await prisma.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 });
    }

    // Delete the text (this will also delete related UserText records due to cascade)
    await prisma.text.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Text deleted successfully" });
  } catch (error) {
    console.error("Error deleting text:", error);
    return NextResponse.json(
      { error: "Failed to delete text" },
      { status: 500 }
    );
  }
}
