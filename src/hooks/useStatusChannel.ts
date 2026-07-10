"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function newChannelId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function useStatusChannel() {
  const channelIdRef = useRef(newChannelId());
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(channelIdRef.current);

    channel
      .on("broadcast", { event: "status" }, ({ payload }) => {
        setStatus((payload as { message: string }).message);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { channelId: channelIdRef.current, status, resetStatus: () => setStatus(null) };
}
