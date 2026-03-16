import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";

export default function CarerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="pb-24 pt-[calc(2rem+env(safe-area-inset-top,0px))] px-4">
                {children}
            </div>
            <BottomNavbar />
        </ProtectedRoute>
    );
}
