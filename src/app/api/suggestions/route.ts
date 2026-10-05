import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const SKILL_POOL = [
  // Health, Fitness & Wellness
  { name: "Hatha Yoga & Flexibility", category: "Wellness", bio: "Master core stability, posture alignment, and full-body flex movement routines." },
  { name: "Pranayama & Deep Breathing", category: "Wellness", bio: "Practice guided breathwork techniques to reduce daily stress and improve focus." },
  { name: "Bodybuilding & Muscle Hypertrophy", category: "Fitness", bio: "Understand progressive overload, workout splits, and targeted strength training." },
  { name: "Calisthenics & Bodyweight Training", category: "Fitness", bio: "Learn muscle-ups, handstands, and core control without gym equipment." },
  { name: "Kettlebell & HIIT Conditioning", category: "Fitness", bio: "High-intensity functional training for cardiovascular endurance and explosive power." },
  { name: "Mindfulness & Meditation Practices", category: "Wellness", bio: "Develop daily silent meditation habits, grounding techniques, and stress resilience." },
  { name: "Running Form & Endurance Building", category: "Fitness", bio: "Optimize stride mechanics, cadence, breathing pace, and half-marathon prep." },

  // Music, Arts & Creative Arts
  { name: "Acoustic Guitar Basics", category: "Music", bio: "Master fundamental open chords, fingerpicking, and strumming rhythm patterns." },
  { name: "Piano & Music Theory Basics", category: "Music", bio: "Read sheet music, understand scale harmonization, and play popular chord progressions." },
  { name: "Vocal Warmups & Pitch Control", category: "Music", bio: "Improve vocal range, diaphragm support, and ear-training exercises." },
  { name: "Digital DSLR Photography", category: "Creative Arts", bio: "Understand ISO, aperture, shutter speed, manual focus, and portrait framing." },
  { name: "Cinematic Video Editing (Premiere Pro)", category: "Creative Arts", bio: "Learn timeline trimming, color grading, sound design, and transition effects." },
  { name: "Watercolor Painting Techniques", category: "Creative Arts", bio: "Master wet-on-wet blending, color harmony, wash layers, and brush control." },
  { name: "UI/UX & Interactive Prototyping", category: "Design", bio: "Design clean user interfaces, wireframes, and interactive prototypes using Figma." },
  { name: "3D Modeling in Blender", category: "Design", bio: "Create low-poly 3D assets, apply procedural shaders, and set up realistic lighting." },

  // Culinary & Lifestyle
  { name: "Artisanal Bread & Sourdough Baking", category: "Culinary", bio: "Learn dough fermentation, wild yeast starter maintenance, and loaf scoring." },
  { name: "Italian Culinary & Fresh Pasta Making", category: "Culinary", bio: "Hand-craft pasta dough from scratch, rolling tagliatelle, and authentic sauces." },
  { name: "Barista Skills & Espresso Extraction", category: "Lifestyle", bio: "Dial in grind sizes, steam silky milk microfoam, and pour latte art patterns." },
  { name: "Personal Financial Planning", category: "Finance", bio: "Build realistic budgets, track investments, emergency funds, and compounding interest." },
  { name: "Indoor Houseplant & Urban Gardening", category: "Lifestyle", bio: "Learn soil potting mixes, propagation, lighting conditions, and watering cycles." },

  // Language & Communication
  { name: "Conversational Spanish Basics", category: "Language", bio: "Practice everyday greetings, travel vocabulary, sentence building, and pronunciation." },
  { name: "Conversational French Basics", category: "Language", bio: "Learn core French vocabulary, verb conjugations, and natural dialogue flow." },
  { name: "Japanese Hiragana & Basic Phrases", category: "Language", bio: "Read Hiragana scripts, understand honorifics, and practice daily expressions." },
  { name: "Sign Language (ASL) Fundamentals", category: "Language", bio: "Master fingerspelling, basic conversational signs, and facial expressions." },
  { name: "Public Speaking & Storytelling", category: "Soft Skills", bio: "Overcome stage fright, structure compelling talks, and improve body language." },

  // Development & Software Engineering
  { name: "Full-Stack Next.js 14 Development", category: "Tech", bio: "Build performant web applications using App Router, Server Components, and React." },
  { name: "FastAPI & Microservices Architecture", category: "Tech", bio: "Develop high-speed Python REST APIs with automatic OpenAPI docs and Pydantic validation." },
  { name: "PostgreSQL & Prisma ORM Optimization", category: "Tech", bio: "Design normalized database schemas, complex relations, and efficient queries." },
  { name: "Tailwind CSS & Responsive Layouts", category: "Tech", bio: "Craft modern, mobile-first web interfaces fast without writing custom CSS files." },
  { name: "React Native & Expo Mobile Apps", category: "Tech", bio: "Build cross-platform iOS and Android applications with a single React codebase." },
  { name: "Python Scripting & Automation", category: "Tech", bio: "Automate repetitive tasks, file management, web scraping, and data processing." },
  { name: "Docker Containerization Essentials", category: "Tech", bio: "Package web applications into lightweight, isolated containers for easy deployment." },
  { name: "Git & GitHub Team Workflows", category: "Tech", bio: "Master branching, rebase strategies, pull request reviews, and merge conflict fixes." },

  // Data Science, AI & Machine Learning
  { name: "Machine Learning with Scikit-Learn", category: "AI & Data", bio: "Train regression, classification, and clustering models on real-world datasets." },
  { name: "Deep Learning & Neural Networks (PyTorch)", category: "AI & Data", bio: "Understand backpropagation, activation functions, and building custom neural nets." },
  { name: "Prompt Engineering & LLM Workflows", category: "AI & Data", bio: "Leverage generative AI APIs, prompt chaining, and vector databases for smart applications." },
  { name: "Data Visualization with Pandas & Seaborn", category: "AI & Data", bio: "Clean messy tabular data and construct insightful statistical charts and graphs." },

  // Business, Product & Marketing
  { name: "SEO & Content Marketing Strategy", category: "Business", bio: "Optimize websites for search engines, keyword research, and organic traffic growth." },
  { name: "Product Management Frameworks", category: "Business", bio: "Define user personas, write product requirement docs (PRDs), and prioritize roadmaps." },
  { name: "Copywriting & High-Converting Headlines", category: "Marketing", bio: "Write persuasive landing page copy, email newsletters, and marketing hooks." },
  { name: "Social Media Brand Building", category: "Marketing", bio: "Plan content calendars, hook audience attention, and grow short-form video reach." },

  // Hardware & Engineering
  { name: "Arduino Microcontroller Prototyping", category: "Engineering", bio: "Wire analog sensors, breadboards, servo motors, and program C++ hardware scripts." },
  { name: "Raspberry Pi & Home Automation", category: "Engineering", bio: "Set up headless Linux OS servers, IoT triggers, and custom home automation tools." },
  { name: "3D Printing & CAD Design (Fusion 360)", category: "Engineering", bio: "Design custom mechanical parts, export STL models, and calibrate 3D printer slicers." },

  // Productivity & Hobbies
  { name: "Speed Reading & Information Retention", category: "Productivity", bio: "Double your reading speed using visual pacing techniques without losing comprehension." },
  { name: "Notion Systems & Personal Knowledge Management", category: "Productivity", bio: "Build interconnected second-brain databases, task trackers, and habit logs." },
  { name: "Chess Strategy & Opening Tactics", category: "Games", bio: "Master board control, tactical pins, forks, endgame checkmate patterns, and opening principles." },
  { name: "Rubik's Cube Speedcubing (CFOP Method)", category: "Hobbies", bio: "Learn cross formation, F2L pairs, OLL algorithms, and PLL solves under 30 seconds." },
  { name: "Creative Writing & Fiction Worldbuilding", category: "Creative", bio: "Develop memorable character arcs, narrative pacing, dialogue rhythm, and fantasy settings." },
  { name: "Podcast Production & Audio Engineering", category: "Media", bio: "Set up condenser microphones, remove background noise in Audacity, and host episodes." }
];

// Fisher-Yates shuffle algorithm for unbiased randomness
function getRandomSkills<T>(array: T[], count: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}


function getRandomSample<T>(array: T[], count: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "all"; // "matched" | "random" | "all"

    const session = await getServerSession(authOptions);
    const userEmail =
      session?.user?.email ||
      (process.env.NODE_ENV === "development" ? "admin@skillswap.com" : null);

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userSkills: {
          include: { skill: true },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (mode === "random") {
      const selectedSkills = getRandomSample(SKILL_POOL, 6);

      const skillSuggestions = selectedSkills.map((skill, index) => ({
        id: `skill-topic-${Date.now()}-${index}`,
        skillName: skill.name,
        category: skill.category,
        description: skill.bio,
        available: true,
        isTopic: true, // Flag used by Dashboard UI to render topic cards
      }));

      return NextResponse.json({ suggestions: skillSuggestions });
    }

    const wantedSkillIds = currentUser.userSkills
      .filter((us) => us.type === "WANTED")
      .map((us) => us.skillId);

    // MODE: MATCHED ONLY (Only query DB for users offering what current user wants)
    if (mode === "matched") {
      if (wantedSkillIds.length === 0) {
        return NextResponse.json({
          suggestions: [],
          message: "You haven't added any wanted skills to your profile yet.",
        });
      }

      const matchedUsers = await prisma.user.findMany({
        where: {
          id: { not: currentUser.id },
          userSkills: {
            some: {
              skillId: { in: wantedSkillIds },
              type: "OFFERED",
            },
          },
        },
        include: {
          userSkills: {
            include: { skill: true },
          },
        },
        take: 12,
      });

      const matchedSuggestions = matchedUsers.map((partner) => {
        const offeredSkill = partner.userSkills.find(
          (us) => us.type === "OFFERED" && wantedSkillIds.includes(us.skillId)
        )?.skill;

        return {
          id: partner.id,
          partnerName: partner.name || "Anonymous Swapper",
          partnerImage: partner.image,
          skillOffered: offeredSkill?.name || "General Skill",
          category: offeredSkill?.category || "General",
          matchScore: "100% Interest Match",
          description: partner.bio || `${partner.name || "This user"} is offering ${offeredSkill?.name || "a skill"}!`,
          available: true,
        };
      });

      return NextResponse.json({ suggestions: matchedSuggestions });
    }

    // MODE: RANDOM / DEFAULT (Queries DB + fills with random 50-skill pool)
    let dbSuggestions: any[] = [];
    if (wantedSkillIds.length > 0) {
      const matchedUsers = await prisma.user.findMany({
        where: {
          id: { not: currentUser.id },
          userSkills: {
            some: {
              skillId: { in: wantedSkillIds },
              type: "OFFERED",
            },
          },
        },
        include: {
          userSkills: { include: { skill: true } },
        },
        take: 10,
      });

      const formattedMatches = matchedUsers.map((partner) => {
        const offeredSkill = partner.userSkills.find(
          (us) => us.type === "OFFERED" && wantedSkillIds.includes(us.skillId)
        )?.skill;

        return {
          id: partner.id,
          partnerName: partner.name || "Anonymous Swapper",
          partnerImage: partner.image,
          skillOffered: offeredSkill?.name || "General Skill",
          category: offeredSkill?.category || "General",
          matchScore: "Direct Match",
          description: partner.bio || `${partner.name || "This user"} is offering ${offeredSkill?.name || "a skill"}!`,
          available: true,
        };
      });

      dbSuggestions = getRandomSample(formattedMatches, 6);
    }

    const neededFallbackCount = 6 - dbSuggestions.length;
    let fallbackSuggestions: any[] = [];

    if (neededFallbackCount > 0) {
      const selectedSkills = getRandomSample(SKILL_POOL, neededFallbackCount);
      fallbackSuggestions = selectedSkills.map((skill, index) => ({
        id: `random-skill-${Date.now()}-${index}`,
        partnerName: "Community Instructor",
        partnerImage: null,
        skillOffered: skill.name,
        category: skill.category,
        matchScore: "Explore Topic",
        description: skill.bio,
        available: true,
      }));
    }

    return NextResponse.json({
      suggestions: [...dbSuggestions, ...fallbackSuggestions],
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}