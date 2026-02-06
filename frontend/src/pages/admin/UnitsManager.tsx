import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CatalogoService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UnitsManager() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");

    const { data: units, isLoading } = useQuery({
        queryKey: ["admin-units"],
        queryFn: CatalogoService.listarUnidades
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, nome }: { id: string; nome: string }) =>
            CatalogoService.atualizarUnidade(id, { nome }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-units"] });
            queryClient.invalidateQueries({ queryKey: ["units"] });
            queryClient.invalidateQueries({ queryKey: ["public-unit"] });
            setEditId(null);
            toast.success("Unidade atualizada.");
        },
        onError: () => toast.error("Erro ao atualizar unidade.")
    });

    const iniciarEdicao = (unit: { id: string; nome: string }) => {
        setEditId(unit.id);
        setEditNome(unit.nome);
    };

    const salvarEdicao = () => {
        if (!editId) return;
        if (!editNome.trim()) {
            toast.error("Informe o nome da unidade.");
            return;
        }
        updateMutation.mutate({ id: editId, nome: editNome.trim() });
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>Voltar</Button>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>
                <p className="text-muted-foreground">Renomeie as unidades existentes.</p>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : (
                    units?.map((unit) => (
                        <Card key={unit.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg">{unit.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {editId === unit.id ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label>Novo nome</Label>
                                            <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
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
                                            Slug: {unit.slug}
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => iniciarEdicao(unit)}>
                                            Renomear
                                        </Button>
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
