import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  PedidoOracao,
  PedidoOracaoStatus,
  PedidoOracaoVisita,
  PrayerEmailPayload,
} from '@/lib/supabaseClient';

interface PrayerRequestFilters {
  status?: PedidoOracaoStatus | '';
  visita_tipo?: PedidoOracaoVisita | '';
  query?: string;
}

export const usePrayerRequest = () => {
  const criarPedidoOracao = async (data: Omit<PedidoOracao, 'id' | 'created_at' | 'updated_at' | 'status' | 'email_notificado_em'>) => {
    const { error } = await supabase
      .from('pedidos_oracao')
      .insert([data]);

    return { error };
  };

  const atualizarPedidoOracao = async (id: number, updates: Partial<PedidoOracao>) => {
    const { data, error } = await supabase
      .from('pedidos_oracao')
      .update(updates)
      .eq('id', id)
      .select();

    return { data, error };
  };

  const notificarPedidoPorEmail = async (payload: PrayerEmailPayload) => {
    const { data, error } = await supabase.functions.invoke('notify-prayer-request', {
      body: payload,
    });

    return { data, error };
  };

  return {
    criarPedidoOracao,
    atualizarPedidoOracao,
    notificarPedidoPorEmail,
    isCreating: false,
    isUpdating: false,
  };
};

export const useAdminPrayerRequests = (
  page = 1,
  limit = 20,
  filters: PrayerRequestFilters = {},
  refreshKey = 0
) => {
  const [pedidos, setPedidos] = React.useState<PedidoOracao[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchPedidos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let request = supabase
          .from('pedidos_oracao')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (filters.status) {
          request = request.eq('status', filters.status);
        }

        if (filters.visita_tipo) {
          request = request.eq('visita_tipo', filters.visita_tipo);
        }

        if (filters.query?.trim()) {
          const safeQuery = filters.query.trim().replace(/,/g, ' ');
          request = request.or(`nome.ilike.%${safeQuery}%,telefone.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`);
        }

        const { data, error: fetchError, count } = await request;

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setPedidos((data as PedidoOracao[]) || []);
        setTotal(count || 0);
      } catch {
        setError('Erro ao buscar pedidos de oração');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, [page, limit, filters.status, filters.visita_tipo, filters.query, refreshKey]);

  return {
    pedidos,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    isLoading,
    error,
  };
};

export const usePrayerRequestStats = () => {
  const [stats, setStats] = React.useState({
    total: 0,
    novo: 0,
    em_atendimento: 0,
    atendido: 0,
    encerrado: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('pedidos_oracao')
        .select('status');

      if (!error && data) {
        const pedidos = data as Array<{ status: PedidoOracaoStatus }>;
        setStats({
          total: pedidos.length,
          novo: pedidos.filter((p) => p.status === 'novo').length,
          em_atendimento: pedidos.filter((p) => p.status === 'em_atendimento').length,
          atendido: pedidos.filter((p) => p.status === 'atendido').length,
          encerrado: pedidos.filter((p) => p.status === 'encerrado').length,
        });
      }

      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};
