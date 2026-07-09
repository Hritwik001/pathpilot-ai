import { z } from "zod";

export const ProfileSchema = z.object({
  roleInterest: z.string().describe("The job role or title the person is aiming for next"),
  yearsExperience: z
    .number()
    .int()
    .min(0)
    .describe("Total years of relevant professional experience, as a whole number"),
  experienceSummary: z
    .string()
    .describe("A polished 2-3 sentence summary of their experience and strengths"),
  skills: z
    .array(z.string())
    .min(1)
    .max(10)
    .describe("Key technical or professional skills, cleaned up and deduplicated"),
  notableProjects: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .describe("Notable projects or achievements, if any were mentioned — empty array if none"),
  preferences: z
    .string()
    .describe("Work preferences such as remote/onsite, industries, team size, etc."),
});

export type GeneratedProfile = z.infer<typeof ProfileSchema>;

export const MatchBatchSchema = z.object({
  matches: z
    .array(
      z.object({
        roleTitle: z.string().describe("Must be chosen verbatim from the provided candidate pool"),
        reasoning: z
          .string()
          .describe(
            "A specific, plain-English 1-2 sentence reason this role fits, referencing the candidate's actual skills/experience — no generic filler"
          ),
        rank: z.number().int().min(1).describe("1 = best fit"),
      })
    )
    .min(8)
    .max(12),
});

export type GeneratedMatchBatch = z.infer<typeof MatchBatchSchema>;
