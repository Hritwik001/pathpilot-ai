"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { buildProfileFromResume } from "@/lib/ai/mock";

export function ResumeUpload({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const setProfile = useOnboardingStore((state) => state.setProfile);
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  async function processFile(file: File) {
    setFileName(file.name);
    setIsParsing(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const profile = buildProfileFromResume(file.name);
    setProfile(profile);
    router.push("/profile");
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
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
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isParsing && inputRef.current?.click()}
        className={`mt-6 flex h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging ? "border-indigo-400/60 bg-indigo-500/[0.06]" : "border-white/15 bg-white/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        {!fileName && (
          <>
            <span className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
              Drop your resume here
            </span>
            <p className="mt-3 text-zinc-400">PDF, up to a few pages — or click to browse.</p>
          </>
        )}

        {fileName && (
          <div>
            <span className="text-sm text-zinc-300">{fileName}</span>
            {isParsing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-400">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                Parsing your resume…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
