import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const completedIds = searchParams.get("completed");

    // Parse completed text IDs from query parameter
    const completedTextIds = completedIds ? completedIds.split(",") : [];

    // Get a random text that hasn't been completed
    const texts = await prisma.text.findMany({
      where: {
        id: {
          notIn: completedTextIds,
        },
      },
      orderBy: {
        dateUploaded: "desc",
      },
    });

    if (!texts || texts.length === 0) {
      return NextResponse.json(
        { error: "No more texts available" },
        { status: 404 }
      );
    }

    // Return a random text from the available ones
    const randomIndex = Math.floor(Math.random() * texts.length);
    const text = texts[randomIndex];

    return NextResponse.json(text);
  } catch (error) {
    console.error("Error fetching next text:", error);
    return NextResponse.json(
      { error: "Failed to fetch text" },
      { status: 500 }
    );
  }
}
