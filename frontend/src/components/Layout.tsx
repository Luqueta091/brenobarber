import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Layout() {
    const location = useLocation();
    const showMyAppointments =
        !location.pathname.startsWith("/my-appointments") &&
        !location.pathname.startsWith("/admin");

    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground flex justify-center">
            <main className="w-full max-w-md min-h-screen bg-card shadow-lg sm:my-8 sm:min-h-[800px] sm:rounded-xl overflow-hidden relative">
                {showMyAppointments && (
                    <div className="flex justify-end p-4">
                        <Button asChild variant="outline" size="sm">
                            <Link to="/my-appointments">Meus agendamentos</Link>
                        </Button>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
}
