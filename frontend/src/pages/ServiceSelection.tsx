import { useServices } from "@/hooks/use-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useNavigate } from "react-router-dom";
import { Scissors, Clock, DollarSign } from "lucide-react";

export default function ServiceSelection() {
    const { unitSlug } = useParams();
    const navigate = useNavigate();
    const { data: services, isLoading, error } = useServices();

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-destructive">Erro ao carregar serviços. Tente novamente.</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)}>Voltar</Button>
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Escolha o Serviço</h1>
                <p className="text-muted-foreground">Qual estilo você procura?</p>
            </div>

            <div className="grid gap-4">
                {services?.map((service) => (
                    <Card
                        key={service.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary"
                        onClick={() => navigate(`/book/${unitSlug}/time?serviceId=${service.id}`)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Scissors className="h-5 w-5" />
                                {service.nome}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{service.duracaoMinutos} min</span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    <span>R$ {Number(service.preco).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
