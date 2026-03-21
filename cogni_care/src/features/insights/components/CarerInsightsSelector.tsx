"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User, ChevronRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  EMPTY_LIST_SUBHEADING,
  EMPTY_PATIENT_LIST,
  PATIENT_ID,
} from "@/constants/carerLandingPage";
import { API_BASE_URL } from "@/constants/auth";
import { Patient } from "@/features/logs/types/logTypes";
import MobilePageLayout from "@/components/shared/MobilePageLayout";
import { PATIENT_RECORDS_TITLE } from "../constants/insightsConstants";

export default function CarerInsightsSelector() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isCarer && user.profileId) {
      const fetchPatients = async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `${API_BASE_URL}/api/carer/patients?carerProfileId=${user?.profileId}`
          );
          const data = await res.json();
          if (data.success) {
            setPatients(data.patients);
          } else {
            setError(data.error || "Failed to fetch patients");
          }
        } catch (err: unknown) {
          console.log("Error: ", err);
          setError("Failed to connect to server");
        } finally {
          setLoading(false);
        }
      };

      fetchPatients();
    }
  }, [user]);

  return (
    <MobilePageLayout
      title={PATIENT_RECORDS_TITLE}
      icon={Activity}
      iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
      iconColorClass="text-white"
    >
      <div className="w-full space-y-6 animate-in fade-in duration-500 mt-4">
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive font-bold text-center border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {patients.length === 0 && !loading && (
            <Card className="border-dashed bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <User className="h-12 w-12 text-slate-300" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">{EMPTY_PATIENT_LIST}</p>
                  <p className="text-sm text-slate-400">
                    {EMPTY_LIST_SUBHEADING}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {patients.map((patient) => {
            return (
              <div key={patient.id} className="block group">
                <Card
                  onClick={() => {
                    router.push(`/insights?patientId=${patient.id}`);
                  }}
                  className="transition-all duration-300 border-slate-100 bg-white/80 backdrop-blur-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-lg tracking-tight transition-colors text-foreground group-hover:text-primary">
                          {patient.name}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <span>
                            {PATIENT_ID} : {patient.id}
                          </span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </MobilePageLayout>
  );
}
