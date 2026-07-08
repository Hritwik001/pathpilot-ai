import type { Profile } from "@/types/profile";

export type ChatAnswers = {
  roleInterest: string;
  yearsExperience: string;
  skills: string;
  preferences: string;
};

export const ONBOARDING_QUESTIONS = [
  {
    key: "roleInterest" as const,
    prompt: "What kind of role are you aiming for next?",
  },
  {
    key: "yearsExperience" as const,
    prompt: "How many years of experience do you have?",
  },
  {
    key: "skills" as const,
    prompt: "What are your strongest skills? Comma-separated is fine.",
  },
  {
    key: "preferences" as const,
    prompt: "Any preferences — remote, industries, team size, anything else?",
  },
];

// Simulates a token-by-token streaming response so the UI already has the
// real streaming/typewriter interaction wired up before Phase 3 swaps this
// out for a genuine Gemini streamText call.
export async function mockStreamText(
  text: string,
  onChunk: (soFar: string) => void,
  speedMs = 14
): Promise<void> {
  const words = text.split(" ");
  let soFar = "";
  for (let i = 0; i < words.length; i++) {
    soFar += (i === 0 ? "" : " ") + words[i];
    onChunk(soFar);
    await new Promise((resolve) => setTimeout(resolve, speedMs));
  }
}

function parseYears(raw: string): number {
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 2;
}

function parseSkills(raw: string): string[] {
  return raw
    .split(/[,/]| and /i)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function buildProfileFromChat(answers: ChatAnswers): Profile {
  const skills = parseSkills(answers.skills);
  const years = parseYears(answers.yearsExperience);

  return {
    source: "chat",
    roleInterest: answers.roleInterest.trim() || "Frontend Engineer",
    yearsExperience: years,
    experienceSummary: `${years} year${years === 1 ? "" : "s"} of experience, aiming for a ${
      answers.roleInterest.trim() || "frontend engineering"
    } role. Strongest in ${skills.slice(0, 3).join(", ") || "modern web development"}.`,
    skills: skills.length ? skills : ["React", "TypeScript", "CSS"],
    notableProjects: [],
    preferences: answers.preferences.trim() || "Open to remote, no strong preference yet.",
  };
}

export function buildProfileFromResume(fileName: string): Profile {
  return {
    source: "resume",
    roleInterest: "Frontend Engineer",
    yearsExperience: 4,
    experienceSummary: `Extracted from ${fileName}. 4 years building production React/Next.js applications, with a focus on performance and UI craft.`,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Performance Optimization"],
    notableProjects: [
      {
        title: "Revenue analytics dashboard",
        description: "Cut render time from 2000ms to 140ms via profiling and memoization.",
      },
      {
        title: "Ticketing platform",
        description: "Rebuilt search and filtering for a 10,000-row dataset with debouncing and pagination.",
      },
    ],
    preferences: "Open to remote, prefers product-focused teams.",
  };
}
