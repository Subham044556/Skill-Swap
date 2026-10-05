import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json(); // action: "ACCEPT" | "REJECT"

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure the currentUser is the receiver of the request
    const swapReq = await prisma.swapRequest.findUnique({
      where: { id: requestId },
    });

    if (!swapReq || swapReq.receiverId !== currentUser.id) {
      return NextResponse.json(
        { error: "Swap request not found or forbidden" },
        { status: 403 }
      );
    }

    const updated = await prisma.swapRequest.update({
      where: { id: requestId },
      data: {
        status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED",
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Error managing swap request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}