import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CatalogoService } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ServicesManager() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [novoNome, setNovoNome] = useState("");
    const [novoDuracao, setNovoDuracao] = useState("");
    const [novoPreco, setNovoPreco] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [editDuracao, setEditDuracao] = useState("");
    const [editPreco, setEditPreco] = useState("");

    const { data: services, isLoading } = useQuery({
        queryKey: ["admin-services"],
        queryFn: CatalogoService.listarServicosAdmin
    });

    const createMutation = useMutation({
        mutationFn: CatalogoService.criarServico,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            setNovoNome("");
            setNovoDuracao("");
            setNovoPreco("");
            toast.success("Serviço criado.");
        },
        onError: () => toast.error("Erro ao criar serviço.")
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { nome?: string; duracaoMinutos?: number; preco?: number } }) =>
            CatalogoService.atualizarServico(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            setEditId(null);
            toast.success("Serviço atualizado.");
        },
        onError: () => toast.error("Erro ao atualizar serviço.")
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
            ativo ? CatalogoService.ativarServico(id) : CatalogoService.desativarServico(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
        },
        onError: () => toast.error("Erro ao atualizar status.")
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => CatalogoService.removerServico(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            toast.success("Serviço removido.");
        },
        onError: (error: any) => {
            if (error?.response?.status === 409) {
                toast.error("Serviço possui agendamentos. Desative para tirar do catálogo.");
                return;
            }
            toast.error("Erro ao remover serviço.");
        }
    });

    const iniciarEdicao = (service: { id: string; nome: string; duracaoMinutos: number; preco: number }) => {
        setEditId(service.id);
        setEditNome(service.nome);
        setEditDuracao(String(service.duracaoMinutos));
        setEditPreco(String(service.preco));
    };

    const salvarEdicao = () => {
        if (!editId) return;
        updateMutation.mutate({
            id: editId,
            payload: {
                nome: editNome,
                duracaoMinutos: Number(editDuracao),
                preco: Number(editPreco)
            }
        });
    };

    const criarServico = () => {
        if (!novoNome || !novoDuracao || !novoPreco) {
            toast.error("Preencha todos os campos.");
            return;
        }
        createMutation.mutate({
            nome: novoNome,
            duracaoMinutos: Number(novoDuracao),
            preco: Number(novoPreco)
        });
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>Voltar</Button>
                <Button onClick={criarServico} disabled={createMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
                <p className="text-muted-foreground">Gerencie o catálogo da barbearia.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Novo Serviço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1">
                        <Label>Nome</Label>
                        <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Duração (min)</Label>
                            <Input
                                type="number"
                                value={novoDuracao}
                                onChange={(e) => setNovoDuracao(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Preço</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={novoPreco}
                                onChange={(e) => setNovoPreco(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : (
                    services?.map((service) => (
                        <Card key={service.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {service.nome}
                                    {service.temAgendamentos ? (
                                        <Badge variant="secondary">Em uso</Badge>
                                    ) : null}
                                </CardTitle>
                                <Switch
                                    checked={service.ativo}
                                    onCheckedChange={(value) =>
                                        toggleMutation.mutate({ id: service.id, ativo: value })
                                    }
                                />
                            </CardHeader>
                            <CardContent>
                                {editId === service.id ? (
                                    <div className="space-y-3">
                                        <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                type="number"
                                                value={editDuracao}
                                                onChange={(e) => setEditDuracao(e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={editPreco}
                                                onChange={(e) => setEditPreco(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={salvarEdicao} disabled={updateMutation.isPending}>
                                                Salvar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            {service.duracaoMinutos} min • R$ {Number(service.preco).toFixed(2)}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => iniciarEdicao(service)}>
                                                Editar
                                            </Button>
                                            {service.temAgendamentos ? (
                                                <span className="text-xs text-muted-foreground self-center">
                                                    Desative pelo switch
                                                </span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm("Remover serviço?")) {
                                                            removeMutation.mutate(service.id);
                                                        }
                                                    }}
                                                >
                                                    Remover
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
