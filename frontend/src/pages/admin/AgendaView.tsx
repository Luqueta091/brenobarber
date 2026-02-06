import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CatalogoService, AgendamentoService } from "@/services/api";
import { useAvailability } from "@/hooks/use-availability";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function AgendaView() {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const [selectedService, setSelectedService] = useState<string>("");

    const { data: units } = useQuery({
        queryKey: ["admin-units"],
        queryFn: CatalogoService.listarUnidades,
    });

    const { data: services } = useQuery({
        queryKey: ["admin-services-options"],
        queryFn: CatalogoService.listarServicos
    });

    const unitSlug = units?.find((u) => u.id === selectedUnit)?.slug || "";

    const { data: freeSlots } = useAvailability(unitSlug, date, selectedService || null);

    const { data: appointments, isLoading, isError } = useQuery({
        queryKey: ["admin-agenda", selectedUnit, date],
        queryFn: () => {
            if (!selectedUnit || !date) return Promise.resolve([]);
            return AgendamentoService.listarAgendaDia(selectedUnit, format(date, "yyyy-MM-dd"));
        },
        enabled: !!selectedUnit && !!date,
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>Voltar</Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Agenda Diária</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Select onValueChange={setSelectedUnit} value={selectedUnit}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione a Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                        {units?.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "dd/MM/yyyy") : <span>Selecione a data</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Select onValueChange={setSelectedService} value={selectedService}>
                    <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Serviço (para horários livres)" />
                    </SelectTrigger>
                    <SelectContent>
                        {services?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
                {!selectedUnit ? (
                    <div className="text-center text-muted-foreground py-10">Selecione uma unidade para ver a agenda.</div>
                ) : !selectedService ? (
                    <div className="text-center text-muted-foreground py-6">Selecione um serviço para ver horários livres.</div>
                ) : freeSlots && freeSlots.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">Nenhum horário livre para este dia.</div>
                ) : freeSlots && freeSlots.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Horários livres</CardTitle>
                            <CardDescription>Slots disponíveis para o serviço selecionado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {freeSlots.map((slot) => (
                                    <div key={slot} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                                        {slot}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>Horários marcados</CardTitle>
                        <CardDescription>Agendamentos já confirmados para o dia.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isError ? (
                            <div className="text-center text-destructive py-6">Falha ao carregar agenda.</div>
                        ) : isLoading ? (
                            <div className="text-center py-6">Carregando...</div>
                        ) : !appointments || appointments.length === 0 ? (
                            <div className="text-center text-muted-foreground py-6">Nenhum agendamento para este dia.</div>
                        ) : (
                            appointments.map((app) => (
                                <Card key={app.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {format(parseISO(app.inicioEm), "HH:mm")} - {format(parseISO(app.fimEm), "HH:mm")}
                                            </CardTitle>
                                            <div className="font-semibold">{app.status}</div>
                                        </div>
                                        <CardDescription>{app.servico?.nome}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{app.clienteNome}</span>
                                            <span className="text-muted-foreground text-sm">({app.clienteTelefone})</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
