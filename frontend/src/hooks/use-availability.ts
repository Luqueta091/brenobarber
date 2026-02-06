import { useQuery } from "@tanstack/react-query";
import { DisponibilidadeService } from "@/services/api";
import { format, parseISO } from "date-fns";

export function useAvailability(unidadeSlug: string, date: Date | undefined, serviceId: string | null) {
    const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;

    return useQuery({
        queryKey: ["availability", unidadeSlug, dateStr, serviceId],
        queryFn: async () => {
            if (!dateStr || !serviceId) return [];
            const slots = await DisponibilidadeService.obterDisponibilidade(unidadeSlug, dateStr, serviceId);
            const times = slots
                .map((slot) => format(parseISO(slot.inicioEm), "HH:mm"))
                .sort((a, b) => a.localeCompare(b));
            return times;
        },
        enabled: !!dateStr && !!serviceId,
    });
}
