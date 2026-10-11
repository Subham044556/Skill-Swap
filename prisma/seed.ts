import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding dummy swappers...");

  // 1. Create Skills catalog
  const skillsData = [
    { name: "React Native & Expo", category: "Tech" },
    { name: "Python Scripting & Automation", category: "Tech" },
    { name: "Cinematic Video Editing", category: "Creative Arts" },
    { name: "3D Modeling & Blender", category: "Design" },
    { name: "Guitar Fundamentals", category: "Music" },
    { name: "Conversational Spanish", category: "Language" },
    { name: "Figma UI/UX Design", category: "Design" },
    { name: "Next.js & Fullstack Web", category: "Tech" },
  ];

  const skillMap: Record<string, string> = {};
  for (const s of skillsData) {
    const createdSkill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skillMap[s.name] = createdSkill.id;
  }

  // 2. Dummy Users with Complementary Skills
  const mockUsers = [
    {
      name: "Aarav Sharma",
      email: "aarav@skillswap.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      bio: "Frontend engineer exploring video editing and music.",
      teaches: "React Native & Expo",
      wants: "Cinematic Video Editing",
    },
    {
      name: "Rohan Patel",
      email: "rohan@skillswap.com",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Python automation enthusiast eager to pick up UI/UX design.",
      teaches: "Python Scripting & Automation",
      wants: "Figma UI/UX Design",
    },
    {
      name: "Priya Nair",
      email: "priya@skillswap.com",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      bio: "Video creator and Premiere Pro editor wanting to build web apps.",
      teaches: "Cinematic Video Editing",
      wants: "Next.js & Fullstack Web",
    },
    {
      name: "Sneha Roy",
      email: "sneha@skillswap.com",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      bio: "3D artist and industrial designer wanting to learn Python.",
      teaches: "3D Modeling & Blender",
      wants: "Python Scripting & Automation",
    },
    {
      name: "Devon Miller",
      email: "devon@skillswap.com",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Acoustic guitarist looking to build mobile apps for musicians.",
      teaches: "Guitar Fundamentals",
      wants: "React Native & Expo",
    },
  ];

  for (const u of mockUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        image: u.image,
        bio: u.bio,
      },
    });

    // Link Teaches (OFFERED)
    if (skillMap[u.teaches]) {
      await prisma.userSkill.upsert({
        where: {
          id: `${user.id}-${skillMap[u.teaches]}-OFFERED`,
        },
        update: {},
        create: {
          id: `${user.id}-${skillMap[u.teaches]}-OFFERED`,
          userId: user.id,
          skillId: skillMap[u.teaches],
          type: "OFFERED",
        },
      }).catch(async () => {
        // Fallback if id is auto-generated in schema
        const exists = await prisma.userSkill.findFirst({
          where: { userId: user.id, skillId: skillMap[u.teaches], type: "OFFERED" },
        });
        if (!exists) {
          await prisma.userSkill.create({
            data: { userId: user.id, skillId: skillMap[u.teaches], type: "OFFERED" },
          });
        }
      });
    }

    // Link Wants (WANTED)
    if (skillMap[u.wants]) {
      const exists = await prisma.userSkill.findFirst({
        where: { userId: user.id, skillId: skillMap[u.wants], type: "WANTED" },
      });
      if (!exists) {
        await prisma.userSkill.create({
          data: { userId: user.id, skillId: skillMap[u.wants], type: "WANTED" },
        });
      }
    }
  }

  console.log("✅ Seeded 5 dummy swappers and 8 skills successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });