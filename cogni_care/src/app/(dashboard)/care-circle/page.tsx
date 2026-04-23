import CareCircleView from "@/features/care-circle/components/CareCircleView";
import { Suspense } from "react";

export const metadata = {
    title: "Care Circle | CogniCare",
    description: "Connect with your carers and get the support you need.",
};

export default function CareCirclePage() {
    return (
        <Suspense fallback={null}>
            <CareCircleView />
        </Suspense>
    );
}
