import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";

export default function CarerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="pb-24">
                {children}
            </div>
            <BottomNavbar />
        </ProtectedRoute>
    );
}
