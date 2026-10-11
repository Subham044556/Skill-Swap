import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Helper to resolve active email (real session or dev fallback)
async function getTargetEmail() {
  const session = await getServerSession(authOptions);
  return (
    session?.user?.email ||
    (process.env.NODE_ENV === "development" ? "admin@skillswap.com" : null)
  );
}

// -------------------------------------------------------------
// GET: Returns all user skills (both WANTED and OFFERED)
// -------------------------------------------------------------
export async function GET() {
  const email = await getTargetEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        userSkills: {
          include: { skill: true },
        },
      },
    });

    // Auto-create dev user in development if missing
    if (!user && process.env.NODE_ENV === "development") {
      user = await prisma.user.create({
        data: { email, name: "Admin Developer" },
        include: { userSkills: { include: { skill: true } } },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedSkills = (user.userSkills || []).map((us) => ({
      id: us.id,
      skillId: us.skillId,
      name: us.skill.name,
      category: us.skill.category,
      type: us.type, // "WANTED" | "OFFERED"
    }));

    return NextResponse.json({
      skills: formattedSkills,
      wantedSkills: formattedSkills.filter((s) => s.type === "WANTED"),
      offeredSkills: formattedSkills.filter((s) => s.type === "OFFERED"),
    });
  } catch (error: any) {
    console.error("GET /api/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill preferences" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Saves skills (supports batch save from Dashboard or single from Preferences)
// -------------------------------------------------------------
export async function POST(req: Request) {
  const email = await getTargetEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user && process.env.NODE_ENV === "development") {
      user = await prisma.user.create({
        data: { email, name: "Admin Developer" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // CASE 1: Batch saving wanted skills (from Dashboard "Save Preferences" button)
    if (Array.isArray(body.skills)) {
      for (const item of body.skills) {
        if (!item.name) continue;
        const skillName = item.name.trim();

        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: {
            name: skillName,
            category: item.category || "General",
          },
        });

        const existingLink = await prisma.userSkill.findFirst({
          where: {
            userId: user.id,
            skillId: skill.id,
            type: "WANTED",
          },
        });

        if (!existingLink) {
          await prisma.userSkill.create({
            data: {
              userId: user.id,
              skillId: skill.id,
              type: "WANTED",
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Skills saved successfully",
      });
    }

    // CASE 2: Single skill add (from Account Preferences page)
    if (body.skillName) {
      const skillName = body.skillName.trim();
      const skillType = body.type === "OFFERED" ? "OFFERED" : "WANTED";

      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: {
          name: skillName,
          category: body.category || "General",
        },
      });

      const existingLink = await prisma.userSkill.findFirst({
        where: {
          userId: user.id,
          skillId: skill.id,
          type: skillType,
        },
      });

      let userSkillRecord = existingLink;
      if (!existingLink) {
        userSkillRecord = await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: skill.id,
            type: skillType,
          },
        });
      }

      return NextResponse.json({
        success: true,
        skill: {
          id: userSkillRecord?.id,
          name: skill.name,
          category: skill.category,
          type: skillType,
        },
      });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to save skill preferences" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// DELETE: Removes a skill from user preferences
// -------------------------------------------------------------
export async function DELETE(req: Request) {
  const email = await getTargetEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { skillName, type } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });

    if (user && skill) {
      await prisma.userSkill.deleteMany({
        where: {
          userId: user.id,
          skillId: skill.id,
          ...(type ? { type } : {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}