import { useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AgendamentoService, CatalogoService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ConfirmationPage() {
    const { unitSlug } = useParams();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const navigate = useNavigate();

    const [nome, setNome] = useState(localStorage.getItem("barber_user_name") || "");
    const [telefone, setTelefone] = useState(localStorage.getItem("barber_user_phone") || "");
    const [confirmed, setConfirmed] = useState(false);

    // Fetch service details for display
    const { data: services } = useQuery({
        queryKey: ["services"],
        queryFn: CatalogoService.listarServicos,
        enabled: !!serviceId
    });

    const service = services?.find(s => s.id === serviceId);

    const createAppointmentFn = async () => {
        if (!unitSlug || !serviceId || !date || !time || !nome || !telefone) throw new Error("Dados incompletos");

        // Construct ISO datetime from date and time
        // date is YYYY-MM-DD, time is HH:mm
        const inicioEm = new Date(`${date}T${time}:00`).toISOString();

        return AgendamentoService.criar({
            unidadeSlug: unitSlug,
            servicoId: serviceId,
            inicioEm,
            nome,
            telefone
        });
    };

    const mutation = useMutation({
        mutationFn: createAppointmentFn,
        onSuccess: () => {
            localStorage.setItem("barber_user_name", nome);
            localStorage.setItem("barber_user_phone", telefone);
            setConfirmed(true);
            toast.success("Agendamento realizado com sucesso!");
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.error?.message ||
                error.message ||
                "Erro ao agendar. Tente novamente.";
            toast.error(msg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (telefone.length < 8) {
            toast.error("Telefone inválido");
            return;
        }
        mutation.mutate();
    };

    if (!serviceId || !date || !time) {
        return <div className="p-6">Dados do agendamento inválidos.</div>;
    }

    if (confirmed) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in zoom-in duration-500">
                <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/20">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Agendado!</h1>
                    <p className="text-muted-foreground">Te esperamos no dia {date.split('-').reverse().join('/')} às {time}</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                    <Button asChild className="w-full">
                        <Link to="/my-appointments">Meus Agendamentos</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link to="/">Voltar ao Início</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>Voltar</Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Confirmar</h1>
                <p className="text-muted-foreground">Quase lá! Finalize seu agendamento.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{service?.nome || "Serviço"}</CardTitle>
                    <CardDescription>{date.split('-').reverse().join('/')} às {time}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-semibold">R$ {service?.preco ? Number(service.preco).toFixed(2) : "0.00"}</span>
                    </div>
                    <Separator />
                    <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Seu Nome</Label>
                            <Input
                                id="nome"
                                placeholder="João Silva"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Seu Telefone</Label>
                            <Input
                                id="telefone"
                                placeholder="11999999999"
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                                type="tel"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Usaremos este número para identificar seus agendamentos.</p>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="booking-form" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Agendamento
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
