import { useQuery } from "@tanstack/react-query";
import { CatalogoService } from "@/services/api";

export function useServices() {
    return useQuery({
        queryKey: ["services"],
        queryFn: CatalogoService.listarServicos,
    });
}
