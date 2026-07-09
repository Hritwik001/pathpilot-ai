import type { Profile } from "@/types/profile";
import { ROLE_ARCHETYPES } from "./role-archetypes";

export function buildMatchBatchPrompt(profile: Profile, excludeRoles: string[]) {
  const exclusion =
    excludeRoles.length > 0
      ? `\nThese roles were already suggested to this candidate before — do NOT suggest them again: ${excludeRoles.join(", ")}.`
      : "";

  return `You are PathPilot, an AI career-matching copilot. Choose 8-12 role types from the candidate pool below that best fit this candidate, ranked best-first (rank 1 = best fit). Choose only from the candidate pool — do not invent new titles.

Candidate profile:
- Role interest: ${profile.roleInterest}
- Years of experience: ${profile.yearsExperience}
- Skills: ${profile.skills.join(", ")}
- Experience summary: ${profile.experienceSummary}
- Notable projects: ${profile.notableProjects.map((p) => `${p.title} — ${p.description}`).join("; ") || "none provided"}
- Preferences: ${profile.preferences}

Candidate pool:
${ROLE_ARCHETYPES.join(", ")}
${exclusion}

For each match, write a specific, plain-English reason it fits — reference their actual skills or experience, not generic filler.`;
}

export function buildPitchPrompt(profile: Profile, roleTitle: string, reasoning: string) {
  return `Write a short, personalized outreach pitch (3-5 sentences) this candidate could send to a hiring manager or use as a cover-letter opener for a "${roleTitle}" role.

Candidate background: ${profile.experienceSummary}
Skills: ${profile.skills.join(", ")}
Why this role fits: ${reasoning}

Tone: confident and specific, not generic. No greeting or sign-off boilerplate — just the pitch body itself. Do not use placeholder brackets like [Company Name].`;
}
