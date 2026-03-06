import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gradient text-white p-6 text-center">
            <h1 className="text-5xl font-black mb-6 tracking-tight">CogniCare</h1>
            <p className="text-xl mb-12 max-w-2xl opacity-90 font-medium">
                Empowering caregivers and patients with intelligent health insights.
                <br />Our landing page is coming soon!
            </p>

            <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-12 h-16 text-lg font-black bg-white text-primary hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95">
                    Go to Dashboard
                </Button>
            </Link>
        </div>
    );
}
