import axios from 'axios';

export interface Servico {
    id: string;
    nome: string;
    duracaoMinutos: number;
    preco: number;
    ativo: boolean;
    temAgendamentos?: boolean;
}

export interface Unidade {
    id: string;
    nome: string;
    slug: string;
}

export interface Agendamento {
    id: string;
    inicioEm: string;
    fimEm: string;
    unidadeId: string;
    servicoId: string;
    status: 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO' | 'FALTA' | 'EM_ATENDIMENTO';
    clienteNome?: string;
    clienteTelefone?: string;
    servico?: Servico;
    unidade?: Unidade;
}

export interface CriarAgendamentoDTO {
    unidadeSlug: string;
    servicoId: string;
    inicioEm: string; // ISO datetime
    nome: string;
    telefone: string;
}

export interface DisponibilidadeSlot {
    inicioEm: string;
    fimEm: string;
}

export interface HorarioTrabalho {
    id: string;
    unidadeId: string;
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    ativo: boolean;
}

export interface BloqueioAgenda {
    id: string;
    inicioEm: string;
    fimEm: string;
    motivo?: string | null;
    unidadeId?: string | null;
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Basic error handling log
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const CatalogoService = {
    listarUnidades: async () => {
        const { data } = await api.get<{ data: Unidade[] }>('/public/unidades');
        return data.data;
    },
    obterUnidade: async (slug: string) => {
        const { data } = await api.get<{ data: Unidade }>(`/public/unidades/${slug}`);
        return data.data;
    },
    listarServicos: async () => {
        const { data } = await api.get<{ data: Servico[] }>('/public/servicos');
        return data.data;
    },
    atualizarUnidade: async (id: string, payload: { nome: string }) => {
        const { data } = await api.put<{ data: Unidade }>(`/admin/unidades/${id}`, payload);
        return data.data;
    },
    listarServicosAdmin: async () => {
        const { data } = await api.get<{ data: Servico[] }>('/admin/servicos');
        return data.data;
    },
    criarServico: async (payload: { nome: string; duracaoMinutos: number; preco: number; ativo?: boolean }) => {
        const { data } = await api.post<{ data: Servico }>('/admin/servicos', payload);
        return data.data;
    },
    atualizarServico: async (id: string, payload: { nome?: string; duracaoMinutos?: number; preco?: number }) => {
        const { data } = await api.put<{ data: Servico }>(`/admin/servicos/${id}`, payload);
        return data.data;
    },
    ativarServico: async (id: string) => {
        const { data } = await api.patch<{ data: Servico }>(`/admin/servicos/${id}/ativar`);
        return data.data;
    },
    desativarServico: async (id: string) => {
        const { data } = await api.patch<{ data: Servico }>(`/admin/servicos/${id}/desativar`);
        return data.data;
    },
    removerServico: async (id: string) => {
        const { data } = await api.delete<{ data: Servico }>(`/admin/servicos/${id}`);
        return data.data;
    }
};

function mapStatus(status?: string): Agendamento['status'] {
    switch (status) {
        case 'Confirmado':
            return 'AGENDADO';
        case 'EmAtendimento':
            return 'EM_ATENDIMENTO';
        case 'Concluido':
            return 'CONCLUIDO';
        case 'Falta':
            return 'FALTA';
        case 'CanceladoCliente':
        case 'CanceladoBarbeiro':
            return 'CANCELADO';
        default:
            return 'AGENDADO';
    }
}

function normalizeAgendamento(data: any): Agendamento {
    return {
        ...data,
        status: mapStatus(data?.status),
        clienteNome: data?.cliente?.nome ?? data?.clienteNome,
        clienteTelefone: data?.cliente?.telefone ?? data?.clienteTelefone,
    };
}

export const DisponibilidadeService = {
    obterDisponibilidade: async (unidadeSlug: string, dataStr: string, servicoId: string) => {
        // dataStr should be YYYY-MM-DD
        const { data } = await api.get<{ data: DisponibilidadeSlot[] }>(`/public/disponibilidade`, {
            params: { unidadeSlug, data: dataStr, servicoId }
        });
        return data.data;
    }
};

export const AgendamentoService = {
    criar: async (payload: CriarAgendamentoDTO) => {
        const { data } = await api.post<{ data: Agendamento }>('/public/agendamentos', payload);
        return normalizeAgendamento(data.data);
    },
    listarPorTelefone: async (telefone: string) => {
        const { data } = await api.get<{ data: Agendamento[] }>('/public/agendamentos', {
            params: { telefone }
        });
        return data.data.map(normalizeAgendamento);
    },
    cancelar: async (id: string, motivo?: string) => {
        const { data } = await api.post<{ data: Agendamento }>(`/public/agendamentos/${id}/cancelar`, { motivo });
        return normalizeAgendamento(data.data);
    },
    listarAgendaDia: async (unidadeId: string, data: string) => {
        const { data: result } = await api.get<{ data: Agendamento[] }>('/admin/agenda/dia', {
            params: { unidadeId, data }
        });
        return result.data.map(normalizeAgendamento);
    }
};

export const AgendaService = {
    listarHorarios: async (unidadeId: string) => {
        const { data } = await api.get<{ data: HorarioTrabalho[] }>('/admin/horarios-trabalho', {
            params: { unidadeId }
        });
        return data.data;
    },
    criarHorario: async (payload: { unidadeId: string; diaSemana: number; horaInicio: string; horaFim: string }) => {
        const { data } = await api.post<{ data: HorarioTrabalho }>('/admin/horarios-trabalho', payload);
        return data.data;
    },
    removerHorario: async (id: string) => {
        const { data } = await api.delete<{ data: HorarioTrabalho }>(`/admin/horarios-trabalho/${id}`);
        return data.data;
    },
    listarBloqueios: async (params: { inicioEm: string; fimEm: string; unidadeId?: string | null }) => {
        const { data } = await api.get<{ data: BloqueioAgenda[] }>('/admin/bloqueios', {
            params
        });
        return data.data;
    },
    criarBloqueio: async (payload: { inicioEm: string; fimEm: string; motivo?: string; unidadeId?: string | null }) => {
        const { data } = await api.post<{ data: BloqueioAgenda }>('/admin/bloqueios', payload);
        return data.data;
    },
    removerBloqueio: async (id: string) => {
        const { data } = await api.delete<{ data: BloqueioAgenda }>(`/admin/bloqueios/${id}`);
        return data.data;
    }
};
