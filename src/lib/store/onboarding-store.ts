import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/profile";

type OnboardingState = {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetProfile: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (patch) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...patch } : state.profile,
        })),
      resetProfile: () => set({ profile: null }),
    }),
    { name: "pathpilot-onboarding" }
  )
);
