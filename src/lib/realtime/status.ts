import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

type StatusReporter = {
  send: (message: string) => void;
  close: () => Promise<void>;
};

const noopReporter: StatusReporter = {
  send: () => {},
  close: async () => {},
};

export async function createStatusReporter(channelId?: string | null): Promise<StatusReporter> {
  if (!channelId) return noopReporter;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const channel: RealtimeChannel = supabase.channel(channelId);

  const subscribed = await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), 3000);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });

  if (!subscribed) {
    await supabase.removeChannel(channel);
    return noopReporter;
  }

  return {
    send: (message: string) => {
      channel.send({ type: "broadcast", event: "status", payload: { message } });
    },
    close: async () => {
      await supabase.removeChannel(channel);
    },
  };
}
