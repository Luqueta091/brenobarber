import { useState } from "react";
import { useMyAppointments, useCancelAppointment } from "@/hooks/use-my-appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, MapPin, AlertCircle, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function MyAppointments() {
    const navigate = useNavigate();
    const [telefone, setTelefone] = useState(localStorage.getItem("barber_user_phone") || "");
    const { data: appointments, isLoading, isError } = useMyAppointments(telefone);
    const cancelMutation = useCancelAppointment();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("barber_user_phone", telefone);
        // React Query will refetch because key includes telefone
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'AGENDADO': return 'bg-blue-500';
            case 'CONCLUIDO': return 'bg-green-500';
            case 'CANCELADO': return 'bg-red-500';
            case 'FALTA': return 'bg-orange-500';
            case 'EM_ATENDIMENTO': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            'AGENDADO': 'Agendado',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado',
            'FALTA': 'Falta',
            'EM_ATENDIMENTO': 'Em Atendimento'
        };
        return map[status] || status;
    }

    const sortedAppointments = appointments?.slice().sort((a, b) =>
        new Date(b.inicioEm).getTime() - new Date(a.inicioEm).getTime()
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/")}>Voltar</Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Meus Agendamentos</h1>
                <p className="text-muted-foreground">Consulte seu histórico e próximos cortes.</p>
            </div>

            {telefone ? (
                <div className="text-center text-muted-foreground text-sm">
                    Agendamentos vinculados ao seu dispositivo.
                </div>
            ) : (
                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mx-auto w-full">
                    <div className="relative flex-1">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Seu telefone"
                            className="pl-9"
                            value={telefone}
                            onChange={e => setTelefone(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Buscar</Button>
                </form>
            )}

            <div className="space-y-4">
                {isLoading && telefone.length >= 8 ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : isError ? (
                    <div className="text-destructive text-center">Erro ao buscar agendamentos.</div>
                ) : !sortedAppointments || sortedAppointments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        <CalendarDays className="mx-auto h-12 w-12 opacity-50 mb-2" />
                        <p>Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    sortedAppointments.map((app) => (
                        <Card key={app.id} className="overflow-hidden">
                            <CardHeader className="pb-3 bg-muted/20">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{app.servico?.nome || "Serviço"}</CardTitle>
                                    <Badge className={statusColor(app.status)}>{formatStatus(app.status)}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {app.unidade?.nome}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(parseISO(app.inicioEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(parseISO(app.inicioEm), "HH:mm")}</span>
                                </div>
                            </CardContent>

                            {app.status === 'AGENDADO' && (
                                <CardFooter className="bg-muted/20 pt-3 pb-3">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            if (confirm("Tem certeza que deseja cancelar?")) {
                                                cancelMutation.mutate({ id: app.id });
                                            }
                                        }}
                                        disabled={cancelMutation.isPending}
                                    >
                                        Cancelar Agendamento
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
