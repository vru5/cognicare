import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavbar from "@/components/BottomNavbar";

export default function SharedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-0 pb-20 px-4">
                {children}
            </div>
            <BottomNavbar />
        </ProtectedRoute>
    );
}
