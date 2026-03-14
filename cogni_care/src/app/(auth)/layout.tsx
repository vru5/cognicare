import { COGNICARE } from "@/constants/landingPage";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Image with Light Overlay to match Home page */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/landing-page.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] flex items-center justify-center bg-foreground backdrop-blur-md border-b border-white/10 shadow-xl z-50">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform hover:scale-105"
        >
          <Image
            src="/images/cogni-care-logo.svg"
            alt="CogniCare Logo"
            width={40}
            height={40}
            className="w-10 h-10 drop-shadow-md brightness-110"
          />
          <span className="text-2xl font-black text-white tracking-widest uppercase">
            {COGNICARE}
          </span>
        </Link>
      </nav>
      <main className="relative z-10 w-full max-w-md mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>
    </div>
  );
}
