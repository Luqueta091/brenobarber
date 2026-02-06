import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, Calendar, Settings, LogOut, MapPin } from "lucide-react";

export default function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("barber_admin_token");
        navigate("/admin/login");
    };

    const menuItems = [
        { label: "Gerenciar Serviços", icon: ListChecks, path: "/admin/services", desc: "Criar, editar e ativar serviços." },
        { label: "Gerenciar Unidades", icon: MapPin, path: "/admin/units", desc: "Renomear unidades existentes." },
        { label: "Agenda Diária", icon: Calendar, path: "/admin/agenda", desc: "Visualizar horários livres e agendados." },
        { label: "Configurações", icon: Settings, path: "/admin/settings", desc: "Horários e bloqueios." },
    ];

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
                <Button variant="ghost" className="text-destructive gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Sair
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {menuItems.map((item) => (
                    <Card
                        key={item.label}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary"
                        onClick={() => navigate(item.path)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </CardTitle>
                            <CardDescription>{item.desc}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
