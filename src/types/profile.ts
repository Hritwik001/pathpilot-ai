export type NotableProject = {
  title: string;
  description: string;
};

export type Profile = {
  source: "chat" | "resume";
  roleInterest: string;
  yearsExperience: number;
  experienceSummary: string;
  skills: string[];
  notableProjects: NotableProject[];
  preferences: string;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};
