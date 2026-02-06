import { useQuery } from "@tanstack/react-query";
import { CatalogoService } from "@/services/api";

export function useUnits() {
    return useQuery({
        queryKey: ["units"],
        queryFn: CatalogoService.listarUnidades,
    });
}
