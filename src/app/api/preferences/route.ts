import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      theme: true,
      language: true,
      timezone: true,
    },
  });

  return NextResponse.json(user);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: {
      email: session.user.email,
    },
    data: {
      theme: body.theme,
      language: body.language,
      timezone: body.timezone,
    },
    select: {
      theme: true,
      language: true,
      timezone: true,
    },
  });

  return NextResponse.json(updatedUser);
}