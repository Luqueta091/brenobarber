import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAvailability } from "@/hooks/use-availability";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { AgendaService, CatalogoService } from "@/services/api";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingTimeSelection() {
    const { unitSlug } = useParams();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get("serviceId");
    const navigate = useNavigate();

    const [date, setDate] = useState<Date | undefined>(new Date());

    const { data: unit } = useQuery({
        queryKey: ["public-unit", unitSlug],
        queryFn: () => CatalogoService.obterUnidade(unitSlug || ""),
        enabled: !!unitSlug
    });

    const { data: horarios } = useQuery({
        queryKey: ["public-unit-horarios", unit?.id],
        queryFn: () => (unit?.id ? AgendaService.listarHorarios(unit.id) : Promise.resolve([])),
        enabled: !!unit?.id
    });

    const diasTrabalho = useMemo(() => {
        if (!horarios) return new Set<number>();
        return new Set(horarios.map((h) => h.diaSemana));
    }, [horarios]);

    const today = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
    }, []);

    const maxDate = useMemo(() => addDays(today, 30), [today]);

    useEffect(() => {
        if (!diasTrabalho || diasTrabalho.size === 0) return;
        const current = date ?? today;
        if (current >= today && diasTrabalho.has(current.getDay())) return;

        let cursor = new Date(today);
        for (let i = 0; i <= 30; i += 1) {
            if (diasTrabalho.has(cursor.getDay())) {
                setDate(new Date(cursor));
                return;
            }
            cursor = addDays(cursor, 1);
        }
    }, [diasTrabalho, date, today]);

    const isDayDisabled = (day: Date) => {
        if (day < today) return true;
        if (day > maxDate) return true;
        if (!diasTrabalho || diasTrabalho.size === 0) return true;
        return !diasTrabalho.has(day.getDay());
    };

    const { data: slots, isLoading, error } = useAvailability(unitSlug || "", date, serviceId);

    if (!serviceId || !unitSlug) {
        return <div className="p-6">Informações inválidas.</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 flex flex-col items-center">
            <div className="w-full flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>Voltar</Button>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Escolha o Horário</h1>
                <p className="text-muted-foreground">Para quando devemos agendar?</p>
            </div>

            <div className="flex flex-col gap-8 w-full max-w-sm">
                <div className="flex justify-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[220px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={ptBR}
                                disabled={isDayDisabled}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-4">
                    <h2 className="font-semibold text-lg">Horários Disponíveis</h2>
                    {horarios && horarios.length === 0 ? (
                        <div className="text-muted-foreground text-center py-4">Nenhum dia de trabalho configurado para esta unidade.</div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-destructive text-sm">Erro ao carregar horários.</div>
                    ) : !slots || slots.length === 0 ? (
                        <div className="text-muted-foreground text-center py-4">Nenhum horário disponível para esta data.</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {slots.map((time) => (
                                <Button
                                    key={time}
                                    variant="outline"
                                    className="w-full hover:bg-primary hover:text-primary-foreground transition-all"
                                    onClick={() => navigate(`/book/${unitSlug}/confirm?serviceId=${serviceId}&date=${format(date!, 'yyyy-MM-dd')}&time=${time}`)}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
