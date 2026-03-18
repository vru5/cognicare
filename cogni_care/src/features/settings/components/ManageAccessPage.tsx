"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPatientCarers } from "@/features/settings/services/settingsService";
import CarerAccessModal from "./CarerAccessModal";

import { CarerAccess, CarersResponse } from "../types/settingTypes";

export default function ManageAccessContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [carers, setCarers] = useState<CarerAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarer, setSelectedCarer] = useState<CarerAccess | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCarers = useCallback(async () => {
    if (!user?.profileId) return;

    try {
      setLoading(true);
      const result: CarersResponse = await getPatientCarers(user.profileId);
      if (result.success && result.carers) {
        setCarers(result.carers);
      }
    } catch (error) {
      console.error("Error fetching carers:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.profileId]);

  useEffect(() => {
    if (!authLoading && user?.isCarer) {
      router.push("/dashboard");
    } else if (!authLoading && user) {
      fetchCarers();
    }
  }, [user, authLoading, router, fetchCarers]);

  const handleCarerClick = (carer: CarerAccess) => {
    setSelectedCarer(carer);
    setIsModalOpen(true);
  };

  if (authLoading || (loading && carers.length === 0)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="self-start -ml-2 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>

        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Carers
            </h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Manage Health Record Access
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 pt-4">
        {carers.length === 0 ? (
          <Card className="border-dashed bg-slate-50/50 rounded-xl py-10">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-full">
                <User className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-600">No Carers Connected</p>
                <p className="text-sm text-slate-400 max-w-xs px-4">
                  When carers use your Patient ID to connect, they will appear
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          carers.map((carer) => (
            <Card
              key={carer.id}
              onClick={() => handleCarerClick(carer)}
              className="group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] border-none bg-white/80 backdrop-blur-xl ring-1 ring-slate-200/50 cursor-pointer rounded-xl overflow-hidden"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110 duration-500">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl shadow-md">
                      <ShieldCheck
                        className={`h-4 w-4 ${
                          (carer.accessSymptomLogs && carer.accessCareCircle)
                            ? "text-green-500"
                            : ((carer.accessSymptomLogs || carer.accessCareCircle) ? "text-yellow-400" : "text-muted-foreground")
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-xl tracking-tight group-hover:text-primary transition-colors">
                      {carer.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      {/* <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                ID: {carer.id}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" /> */}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          (carer.accessSymptomLogs && carer.accessCareCircle)
                            ? "bg-green-100 text-green-600"
                            : ((carer.accessSymptomLogs || carer.accessCareCircle) ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-400")
                        }`}
                      >
                        {carer.accessSymptomLogs && carer.accessCareCircle
                          ? "Full Access"
                          : carer.accessSymptomLogs || carer.accessCareCircle
                          ? "Patial Access"
                          : "Restricted"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-xl group-hover:bg-primary transition-all duration-500">
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CarerAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        carer={selectedCarer}
        onSuccess={fetchCarers}
      />
    </div>
  );
}
