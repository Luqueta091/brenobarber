import { useUnits } from "@/hooks/use-units";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function UnitSelection() {
    const { data: units, isLoading, error } = useUnits();
    const navigate = useNavigate();

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
        return <div className="p-6 text-destructive">Erro ao carregar unidades. Tente novamente.</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Escolha a Unidade</h1>
                <p className="text-muted-foreground">Onde você quer cortar o cabelo hoje?</p>
            </div>

            <div className="grid gap-4">
                {units?.map((unit) => (
                    <Card
                        key={unit.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary"
                        onClick={() => navigate(`/book/${unit.slug}`)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl">{unit.nome}</CardTitle>
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Toque para selecionar
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
