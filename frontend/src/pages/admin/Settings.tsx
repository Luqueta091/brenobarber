import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, addMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaService, CatalogoService, type BloqueioAgenda } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

const DIAS_SEMANA = [
    { label: "Segunda", value: "1" },
    { label: "Terça", value: "2" },
    { label: "Quarta", value: "3" },
    { label: "Quinta", value: "4" },
    { label: "Sexta", value: "5" },
    { label: "Sábado", value: "6" },
    { label: "Domingo", value: "0" }
];

const SLOT_INTERVAL_MINUTES = 30;

function parseTimeToMinutes(time: string) {
    const [hour, minute] = time.split(":");
    return Number(hour) * 60 + Number(minute);
}

function formatMinutes(minutes: number) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function nextDateForWeekday(targetWeekday: number, baseDate = new Date()) {
    const currentWeekday = baseDate.getDay();
    const diff = (targetWeekday - currentWeekday + 7) % 7;
    const next = addDays(baseDate, diff);
    return format(next, "yyyy-MM-dd");
}

export default function Settings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [unidadeId, setUnidadeId] = useState<string>("");
    const [diaSemana, setDiaSemana] = useState("1");
    const [horaInicio, setHoraInicio] = useState("09:00");
    const [horaFim, setHoraFim] = useState("18:00");

    const [bloqueioUnidadeId, setBloqueioUnidadeId] = useState<string | "">("");
    const [bloqueioDiaSemana, setBloqueioDiaSemana] = useState("");
    const [bloqueioData, setBloqueioData] = useState("");
    const [bloqueioMotivo, setBloqueioMotivo] = useState("");

    const { data: unidades } = useQuery({
        queryKey: ["admin-units"],
        queryFn: CatalogoService.listarUnidades
    });

    const { data: horarios } = useQuery({
        queryKey: ["admin-horarios", unidadeId],
        queryFn: () => (unidadeId ? AgendaService.listarHorarios(unidadeId) : Promise.resolve([])),
        enabled: !!unidadeId
    });

    const { data: horariosBloqueio } = useQuery({
        queryKey: ["admin-horarios-bloqueio", bloqueioUnidadeId],
        queryFn: () => (bloqueioUnidadeId ? AgendaService.listarHorarios(bloqueioUnidadeId) : Promise.resolve([])),
        enabled: !!bloqueioUnidadeId
    });

    const range = useMemo(() => {
        const inicio = new Date();
        const fim = addDays(inicio, 30);
        return { inicio, fim };
    }, []);

    const { data: bloqueios } = useQuery({
        queryKey: ["admin-bloqueios", bloqueioUnidadeId, range.inicio, range.fim],
        queryFn: () =>
            AgendaService.listarBloqueios({
                inicioEm: range.inicio.toISOString(),
                fimEm: range.fim.toISOString(),
                unidadeId: bloqueioUnidadeId || null
            }),
        enabled: true
    });

    const { data: bloqueiosDia } = useQuery({
        queryKey: ["admin-bloqueios-dia", bloqueioUnidadeId, bloqueioData],
        queryFn: () => {
            if (!bloqueioData) return Promise.resolve([]);
            const inicio = new Date(`${bloqueioData}T00:00:00`);
            const fim = addDays(inicio, 1);
            return AgendaService.listarBloqueios({
                inicioEm: inicio.toISOString(),
                fimEm: fim.toISOString(),
                unidadeId: bloqueioUnidadeId || null
            });
        },
        enabled: !!bloqueioUnidadeId && !!bloqueioData
    });

    const criarHorario = useMutation({
        mutationFn: AgendaService.criarHorario,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-horarios", unidadeId] });
            toast.success("Horário criado.");
        },
        onError: () => toast.error("Erro ao criar horário.")
    });

    const removerHorario = useMutation({
        mutationFn: AgendaService.removerHorario,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-horarios", unidadeId] });
            toast.success("Horário removido.");
        },
        onError: () => toast.error("Erro ao remover horário.")
    });

    const criarBloqueio = useMutation({
        mutationFn: AgendaService.criarBloqueio,
        onMutate: async (payload) => {
            if (!bloqueioUnidadeId || !bloqueioData) return undefined;
            const key = ["admin-bloqueios-dia", bloqueioUnidadeId, bloqueioData];
            await queryClient.cancelQueries({ queryKey: key });
            const previous = queryClient.getQueryData<BloqueioAgenda[]>(key);
            const tempId = `temp-${Date.now()}`;
            const optimistic: BloqueioAgenda = {
                id: tempId,
                inicioEm: payload.inicioEm,
                fimEm: payload.fimEm,
                motivo: payload.motivo ?? null,
                unidadeId: payload.unidadeId ?? null
            };
            queryClient.setQueryData<BloqueioAgenda[]>(key, (old = []) => [...old, optimistic]);
            return { key, previous, tempId };
        },
        onError: (_err, _payload, context) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous);
            }
            toast.error("Erro ao criar bloqueio.");
        },
        onSuccess: (novo, _payload, context) => {
            queryClient.invalidateQueries({ queryKey: ["admin-bloqueios"] });
            queryClient.invalidateQueries({ queryKey: ["admin-bloqueios-dia"] });
            if (context?.key) {
                queryClient.setQueryData<BloqueioAgenda[]>(context.key, (old = []) =>
                    old.map((item) => (item.id === context.tempId ? novo : item))
                );
            }
            setBloqueioMotivo("");
            toast.success("Bloqueio criado.");
        }
    });

    const removerBloqueio = useMutation({
        mutationFn: AgendaService.removerBloqueio,
        onMutate: async (id) => {
            if (!bloqueioUnidadeId || !bloqueioData) return undefined;
            const key = ["admin-bloqueios-dia", bloqueioUnidadeId, bloqueioData];
            await queryClient.cancelQueries({ queryKey: key });
            const previous = queryClient.getQueryData<BloqueioAgenda[]>(key);
            queryClient.setQueryData<BloqueioAgenda[]>(key, (old = []) =>
                old.filter((item) => item.id !== id)
            );
            return { key, previous };
        },
        onError: (_err, _id, context) => {
            if (context?.key) {
                queryClient.setQueryData(context.key, context.previous);
            }
            toast.error("Erro ao remover bloqueio.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-bloqueios"] });
            queryClient.invalidateQueries({ queryKey: ["admin-bloqueios-dia"] });
            toast.success("Bloqueio removido.");
        }
    });

    useEffect(() => {
        setBloqueioDiaSemana("");
        setBloqueioData("");
    }, [bloqueioUnidadeId]);

    const diasTrabalhoBloqueio = useMemo(() => {
        if (!horariosBloqueio || horariosBloqueio.length === 0) return [];
        return DIAS_SEMANA.filter((dia) =>
            horariosBloqueio.some((h) => h.diaSemana === Number(dia.value))
        );
    }, [horariosBloqueio]);

    const horariosDiaSelecionado = useMemo(() => {
        if (!horariosBloqueio || !bloqueioDiaSemana) return [];
        const dia = Number(bloqueioDiaSemana);
        return horariosBloqueio.filter((h) => h.diaSemana === dia);
    }, [horariosBloqueio, bloqueioDiaSemana]);

    const slotsDiaSelecionado = useMemo(() => {
        if (!horariosDiaSelecionado || horariosDiaSelecionado.length === 0) return [];
        const slots = new Set<string>();
        horariosDiaSelecionado.forEach((h) => {
            const inicio = parseTimeToMinutes(h.horaInicio);
            const fim = parseTimeToMinutes(h.horaFim);
            for (let t = inicio; t + SLOT_INTERVAL_MINUTES <= fim; t += SLOT_INTERVAL_MINUTES) {
                slots.add(formatMinutes(t));
            }
        });
        return Array.from(slots).sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    }, [horariosDiaSelecionado]);

    const bloqueiosDoDia = useMemo(() => {
        if (!bloqueioData) return [];
        if (bloqueiosDia) return bloqueiosDia;
        if (!bloqueios) return [];
        return bloqueios.filter((b) => format(new Date(b.inicioEm), "yyyy-MM-dd") === bloqueioData);
    }, [bloqueios, bloqueiosDia, bloqueioData]);

    const bloqueiosMinutos = useMemo(() => {
        return bloqueiosDoDia.map((b) => {
            const inicio = parseTimeToMinutes(format(new Date(b.inicioEm), "HH:mm"));
            const fim = parseTimeToMinutes(format(new Date(b.fimEm), "HH:mm"));
            return { id: b.id, inicio, fim };
        });
    }, [bloqueiosDoDia]);

    const bloqueioDateObj = useMemo(() => {
        if (!bloqueioData) return undefined;
        return new Date(`${bloqueioData}T00:00:00`);
    }, [bloqueioData]);

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>Voltar</Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Horários de trabalho e bloqueios.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Horários de Trabalho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="space-y-1">
                            <Label>Unidade</Label>
                            <Select value={unidadeId} onValueChange={setUnidadeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidades?.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Dia da semana</Label>
                                <Select value={diaSemana} onValueChange={setDiaSemana}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIAS_SEMANA.map((dia) => (
                                            <SelectItem key={dia.value} value={dia.value}>{dia.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Hora início</Label>
                                <Input value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} placeholder="09:00" />
                            </div>
                            <div className="space-y-1">
                                <Label>Hora fim</Label>
                                <Input value={horaFim} onChange={(e) => setHoraFim(e.target.value)} placeholder="18:00" />
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                if (!unidadeId) return toast.error("Selecione a unidade.");
                                criarHorario.mutate({
                                    unidadeId,
                                    diaSemana: Number(diaSemana),
                                    horaInicio,
                                    horaFim
                                });
                            }}
                        >
                            Adicionar horário
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {horarios && horarios.length > 0 ? (
                            horarios.map((h) => (
                                <div key={h.id} className="flex items-center justify-between border rounded-md p-2">
                                    <div>
                                        {DIAS_SEMANA.find((dia) => dia.value === String(h.diaSemana))?.label || `Dia ${h.diaSemana}`} — {h.horaInicio} às {h.horaFim}
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => removerHorario.mutate(h.id)}>
                                        Remover
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">Nenhum horário cadastrado.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bloqueios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="space-y-1">
                            <Label>Unidade</Label>
                            <Select
                                value={bloqueioUnidadeId || ""}
                                onValueChange={(value) => setBloqueioUnidadeId(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidades?.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {!bloqueioUnidadeId ? (
                            <div className="text-sm text-muted-foreground">Selecione uma unidade para ver dias e horários.</div>
                        ) : diasTrabalhoBloqueio.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Nenhum dia de trabalho cadastrado para esta unidade.</div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Dias de trabalho</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {diasTrabalhoBloqueio.map((dia) => (
                                            <Button
                                                key={dia.value}
                                                variant={bloqueioDiaSemana === dia.value ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setBloqueioDiaSemana(dia.value);
                                                    const nextDate = nextDateForWeekday(Number(dia.value));
                                                    setBloqueioData(nextDate);
                                                }}
                                            >
                                                {dia.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {bloqueioDiaSemana && (
                                    <div className="grid gap-3">
                                        <div className="space-y-1">
                                            <Label>Data do bloqueio</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-[220px] justify-start text-left font-normal",
                                                            !bloqueioData && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {bloqueioData
                                                            ? format(new Date(`${bloqueioData}T00:00:00`), "dd/MM/yyyy")
                                                            : "Selecione a data"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={bloqueioDateObj}
                                                        onSelect={(date) => {
                                                            if (!date) return;
                                                            setBloqueioData(format(date, "yyyy-MM-dd"));
                                                        }}
                                                        locale={ptBR}
                                                        captionLayout="dropdown"
                                                        disabled={(date) => date.getDay() !== Number(bloqueioDiaSemana)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Motivo</Label>
                                            <Input value={bloqueioMotivo} onChange={(e) => setBloqueioMotivo(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {bloqueioDiaSemana && bloqueioData && (
                                    <div className="space-y-2">
                                        <Label>Horários disponíveis</Label>
                                        {slotsDiaSelecionado.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">Nenhum horário configurado para este dia.</div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {slotsDiaSelecionado.map((slot) => {
                                                    const slotMinutes = parseTimeToMinutes(slot);
                                                    const bloqueioEncontrado = bloqueiosMinutos.find(
                                                        (b) => slotMinutes >= b.inicio && slotMinutes < b.fim
                                                    );
                                                    const bloqueado = Boolean(bloqueioEncontrado);
                                                    return (
                                                        <Button
                                                            key={slot}
                                                            size="sm"
                                                            variant={bloqueado ? "secondary" : "outline"}
                                                            className={
                                                                bloqueado
                                                                    ? "bg-slate-900 text-white hover:bg-slate-900 hover:text-white border-slate-900"
                                                                    : undefined
                                                            }
                                                            onClick={() => {
                                                                if (!bloqueioUnidadeId) return toast.error("Selecione a unidade.");
                                                                if (bloqueioEncontrado) {
                                                                    removerBloqueio.mutate(bloqueioEncontrado.id);
                                                                    return;
                                                                }
                                                                const inicio = new Date(`${bloqueioData}T${slot}:00`);
                                                                const fim = addMinutes(inicio, SLOT_INTERVAL_MINUTES);
                                                                criarBloqueio.mutate({
                                                                    inicioEm: inicio.toISOString(),
                                                                    fimEm: fim.toISOString(),
                                                                    motivo: bloqueioMotivo || undefined,
                                                                    unidadeId: bloqueioUnidadeId
                                                                });
                                                            }}
                                                        >
                                                            {slot} {bloqueado ? "(bloqueado)" : ""}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        {bloqueios && bloqueios.length > 0 ? (
                            bloqueios.map((b) => (
                                <div key={b.id} className="flex items-center justify-between border rounded-md p-2">
                                    <div>
                                        {format(new Date(b.inicioEm), "dd/MM/yyyy HH:mm", { locale: ptBR })} - {format(new Date(b.fimEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        {b.motivo ? ` — ${b.motivo}` : ""}
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => removerBloqueio.mutate(b.id)}>
                                        Remover
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">Nenhum bloqueio no período.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
