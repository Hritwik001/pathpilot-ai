export type MatchStatus = "new" | "applied" | "dismissed";

export type Match = {
  id: string;
  rank: number;
  roleTitle: string;
  reasoning: string;
  status: MatchStatus;
  pitch: string | null;
};
