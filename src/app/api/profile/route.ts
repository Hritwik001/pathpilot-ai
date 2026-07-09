import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export async function POST(request: Request) {
  const { profile } = (await request.json()) as { profile: Profile };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    source: profile.source,
    role_interest: profile.roleInterest,
    years_experience: profile.yearsExperience,
    experience_summary: profile.experienceSummary,
    skills: profile.skills,
    notable_projects: profile.notableProjects,
    preferences: profile.preferences,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
