"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { JOIN_CONGNICARE, SIGN_IN } from "@/constants/registerationPage";
import { COGNICARE, EMPOWERING_SUB_HEADING, HEALTH_COMPANION_TEXT, INSIGHT_SUB_HEADING } from "@/constants/landingPage";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Heavy Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/landing-page.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      </div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center"
      >
        {/* Logo - Background removed via blending */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-10"
        >
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
            <Image
              src="/images/cogni-care-logo.svg"
              alt="CogniCare Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </motion.div>

        {/* Text Section */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            {COGNICARE}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed">
            {EMPOWERING_SUB_HEADING} <br />
            <span className="text-primary font-bold italic">{INSIGHT_SUB_HEADING}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-4">
          <Link href="/register" className="w-full">
            <Button
              size="lg"
              className="w-full h-16 rounded-full text-lg font-black bg-primary text-foreground shadow-[0_10px_25px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-all"
            >
              {JOIN_CONGNICARE}
            </Button>
          </Link>

          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 rounded-full text-lg font-black border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
            >
              {SIGN_IN}
            </Button>
          </Link>
        </div>

        {/* Footer Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground"
        >
          {HEALTH_COMPANION_TEXT}
        </motion.p>
      </motion.div>
    </div>
  );
}
