"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModeSelect } from "@/components/onboarding/ModeSelect";
import { ChatOnboarding } from "@/components/onboarding/ChatOnboarding";
import { ResumeUpload } from "@/components/onboarding/ResumeUpload";

type Step = "select" | "chat" | "resume";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("select");

  return (
    <div className="mx-auto max-w-2xl pt-8">
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModeSelect onSelectChat={() => setStep("chat")} onSelectResume={() => setStep("resume")} />
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChatOnboarding onBack={() => setStep("select")} />
          </motion.div>
        )}

        {step === "resume" && (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ResumeUpload onBack={() => setStep("select")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
