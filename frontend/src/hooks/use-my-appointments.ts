import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendamentoService } from "@/services/api";
import { toast } from "sonner";

export function useMyAppointments(telefone: string) {
    return useQuery({
        queryKey: ["my-appointments", telefone],
        queryFn: () => AgendamentoService.listarPorTelefone(telefone),
        enabled: telefone.length >= 8,
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
            AgendamentoService.cancelar(id, motivo),
        onSuccess: () => {
            toast.success("Agendamento cancelado.");
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        },
        onError: () => {
            toast.error("Erro ao cancelar agendamento.");
        }
    });
}
