import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userEmail =
      session?.user?.email ||
      (process.env.NODE_ENV === "development"
        ? "admin@skillswap.com"
        : null);

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        name: true,
        lastSeenAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    let message = `Welcome, ${user.name || "there"}!`;

    // If the user has visited before, check how long ago.
    if (user.lastSeenAt) {
      const difference =
        now.getTime() - new Date(user.lastSeenAt).getTime();

      const daysSinceLastVisit =
        difference / (1000 * 60 * 60 * 24);

      // 3 or more days = Welcome back
      if (daysSinceLastVisit >= 3) {
        message = `Welcome back, ${user.name || "there"}!`;
      }
    }

    // IMPORTANT:
    // Update this AFTER checking the old value.
    await prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        lastSeenAt: now,
      },
    });

    return NextResponse.json({
      message,
    });
  } catch (error) {
    console.error("Welcome API error:", error);

    return NextResponse.json(
      { error: "Failed to load welcome message" },
      { status: 500 }
    );
  }
}