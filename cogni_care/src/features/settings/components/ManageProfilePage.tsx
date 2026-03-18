"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFullProfile } from "@/features/settings/services/settingsService";
import { ArrowLeft, User, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile, ProfileResponse } from "../types/settingTypes";

export default function ManageProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
        getFullProfile(user.userId)
            .then((res: ProfileResponse) => {
                if (res.success && res.profile) {
                    setProfile(res.profile);
                }
            }).finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 py-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="self-start -ml-2 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full px-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Settings
      </Button>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 hover:bg-primary hover:text-white transition-colors">
            <Pencil className="w-4 h-4 text-primary group-hover:text-white" />
          </button>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          {profile?.name ?? "Your Profile"}
        </h1>
      </div>

      {/* Fields */}
      <div className="space-y-4 pt-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
            Full Name
          </label>
          <div className="h-14 px-5 flex items-center rounded-2xl bg-slate-50 border border-slate-200 text-foreground font-semibold">
            {profile?.name ?? "—"}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
            Email
          </label>
          <div className="h-14 px-5 flex items-center rounded-2xl bg-slate-50 border border-slate-200 text-foreground font-semibold">
            {profile?.email ?? "—"}
          </div>
        </div>

        {/* Phone */}
        {profile?.phone && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
              Phone
            </label>
            <div className="h-14 px-5 flex items-center rounded-2xl bg-slate-50 border border-slate-200 text-foreground font-semibold">
              {profile.phone}
            </div>
          </div>
        )}

        {/* Profile ID — greyed out, not editable */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
            {user?.isCarer ? "Carer ID" : "Patient ID"}
          </label>
          <div className="h-14 px-5 flex items-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-mono text-sm select-all cursor-not-allowed">
            {profile?.profileId ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground px-1">
            This ID cannot be changed
          </p>
        </div>
      </div>
    </div>
  );
}
