"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Construction } from "lucide-react";

export default function InsightsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <LineChart className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            </div>

            <Card className="border-dashed py-24">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-6 bg-muted rounded-full">
                        <Construction className="w-12 h-12 text-muted-foreground animate-bounce" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-sm">
                            We're building powerful AI insights to help you track progress and identify patterns in cognitive health.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
