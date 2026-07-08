"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import type { Profile } from "@/types/profile";

function SkillPills({ profile }: { profile: Profile }) {
  const updateProfile = useOnboardingStore((state) => state.updateProfile);
  const [draft, setDraft] = useState("");

  function addSkill() {
    const value = draft.trim();
    if (!value || profile.skills.includes(value)) return;
    updateProfile({ skills: [...profile.skills, value] });
    setDraft("");
  }

  function removeSkill(skill: string) {
    updateProfile({ skills: profile.skills.filter((s) => s !== skill) });
  }

  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">Skills</label>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <motion.span
            key={skill}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-zinc-500 transition-colors hover:text-zinc-200"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </motion.span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
          onBlur={addSkill}
          placeholder="Add a skill…"
          className="w-32 rounded-full border border-dashed border-white/15 bg-transparent px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-400/50"
        />
      </div>
    </div>
  );
}

export function ProfileCard({ profile }: { profile: Profile }) {
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  return (
    <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Role interest
          </label>
          <input
            value={profile.roleInterest}
            onChange={(event) => updateProfile({ roleInterest: event.target.value })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-400/50"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Years of experience
          </label>
          <input
            type="number"
            min={0}
            value={profile.yearsExperience}
            onChange={(event) => updateProfile({ yearsExperience: Number(event.target.value) || 0 })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-400/50"
          />
        </div>
      </div>

      <SkillPills profile={profile} />

      <div>
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
          Experience summary
        </label>
        <textarea
          value={profile.experienceSummary}
          onChange={(event) => updateProfile({ experienceSummary: event.target.value })}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none focus:border-indigo-400/50"
        />
      </div>

      {profile.notableProjects.length > 0 && (
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Notable projects
          </label>
          <div className="mt-3 space-y-3">
            {profile.notableProjects.map((project) => (
              <div key={project.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-sm font-medium text-zinc-100">{project.title}</span>
                <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
          Preferences
        </label>
        <textarea
          value={profile.preferences}
          onChange={(event) => updateProfile({ preferences: event.target.value })}
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none focus:border-indigo-400/50"
        />
      </div>
    </div>
  );
}
