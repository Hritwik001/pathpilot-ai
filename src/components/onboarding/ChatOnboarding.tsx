"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { useStatusChannel } from "@/hooks/useStatusChannel";
import { ONBOARDING_QUESTIONS, buildProfileFromChat, mockStreamText, type ChatAnswers } from "@/lib/ai/mock";
import type { Profile } from "@/types/profile";
import type { ChatMessage } from "@/types/profile";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function ChatOnboarding({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const setProfile = useOnboardingStore((state) => state.setProfile);
  const { channelId, status } = useStatusChannel();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const answersRef = useRef<Partial<ChatAnswers>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  async function streamAssistantMessage(text: string) {
    setIsAssistantTyping(true);
    const id = newId();
    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);
    await mockStreamText(text, (soFar) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: soFar } : m)));
    });
    setIsAssistantTyping(false);
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    streamAssistantMessage(ONBOARDING_QUESTIONS[0].prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value || isAssistantTyping || isDone) return;

    setMessages((prev) => [...prev, { id: newId(), role: "user", content: value }]);
    setInput("");

    const currentKey = ONBOARDING_QUESTIONS[questionIndex].key;
    answersRef.current[currentKey] = value;

    const nextIndex = questionIndex + 1;
    if (nextIndex < ONBOARDING_QUESTIONS.length) {
      setQuestionIndex(nextIndex);
      await streamAssistantMessage(ONBOARDING_QUESTIONS[nextIndex].prompt);
      return;
    }

    setIsDone(true);
    await streamAssistantMessage("Got it — building your profile now.");

    const finalAnswers = answersRef.current as ChatAnswers;
    let profile: Profile;
    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, statusChannel: channelId }),
      });
      if (!response.ok) throw new Error("chat profile request failed");
      const data = await response.json();
      profile = data.profile as Profile;
    } catch {
      profile = buildProfileFromChat(finalAnswers);
    }

    setProfile(profile);
    router.push("/profile");
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        ← Back
      </button>

      <div
        ref={scrollRef}
        className="mt-6 flex h-[420px] flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                message.role === "assistant"
                  ? "self-start bg-white/[0.06] text-zinc-100"
                  : "self-end bg-indigo-500/90 text-white"
              }`}
            >
              {message.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isDone && status && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isAssistantTyping || isDone}
          placeholder="Type your answer…"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-indigo-400/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isAssistantTyping || isDone || !input.trim()}
          className="rounded-full bg-zinc-50 px-6 py-3 text-sm font-medium text-zinc-950 transition-opacity hover:bg-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
