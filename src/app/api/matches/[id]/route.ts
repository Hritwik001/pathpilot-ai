import { createClient } from "@/lib/supabase/server";
import type { MatchStatus } from "@/types/match";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, pitch } = (await request.json()) as { status?: MatchStatus; pitch?: string };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (pitch !== undefined) patch.pitch = pitch;

  const { error } = await supabase.from("matches").update(patch).eq("id", id).eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
