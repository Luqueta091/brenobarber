import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [token, setToken] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        localStorage.setItem("barber_admin_token", token);
        toast.success("Token salvo");
        navigate("/admin/dashboard");
    };

    return (
        <div className="flex items-center justify-center min-h-[50vh] p-6 animate-in fade-in duration-500">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Acesso Administrativo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Token de Acesso"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                        />
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="login-form" className="w-full">Entrar</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
