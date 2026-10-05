import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    if (sender.id === receiverId) {
      return NextResponse.json(
        { error: "You cannot send a swap request to yourself" },
        { status: 400 }
      );
    }

    // Check if a request already exists between these two users (in either direction)
    const existing = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: sender.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: `Request already exists with status: ${existing.status}` },
        { status: 400 }
      );
    }

    const newRequest = await prisma.swapRequest.create({
      data: {
        senderId: sender.id,
        receiverId: receiverId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error sending swap request:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}