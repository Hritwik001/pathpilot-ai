import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Match, MatchStatus } from "@/types/match";

type MatchesState = {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  updateStatus: (id: string, status: MatchStatus) => void;
  setPitch: (id: string, pitch: string) => void;
  allSeenRoleTitles: () => string[];
};

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: [],
      setMatches: (matches) => set({ matches }),
      updateStatus: (id, status) =>
        set((state) => ({
          matches: state.matches.map((m) => (m.id === id ? { ...m, status } : m)),
        })),
      setPitch: (id, pitch) =>
        set((state) => ({
          matches: state.matches.map((m) => (m.id === id ? { ...m, pitch } : m)),
        })),
      allSeenRoleTitles: () => get().matches.map((m) => m.roleTitle),
    }),
    { name: "pathpilot-matches" }
  )
);
