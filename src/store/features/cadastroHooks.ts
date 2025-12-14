import React from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MembroIgreja } from '../lib/supabaseClient';

// Hook customizado para funcionalidades de cadastro com Supabase
export const useCadastro = () => {
  const criarCadastro = async (data: Omit<MembroIgreja, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: result, error } = await supabase
      .from('membros_igreja')
      .insert([data])
      .select();
    
    return { data: result, error };
  };

  const atualizarCadastro = async (id: number, updates: Partial<MembroIgreja>) => {
    const { data, error } = await supabase
      .from('membros_igreja')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  };

  return {
    criarCadastro,
    atualizarCadastro,
    isCreating: false,
    isUpdating: false,
  };
};

// Hook para buscar cadastros (admin)
export const useAdminCadastros = (page = 1, limit = 50, status?: string) => {
  const [cadastros, setCadastros] = React.useState<MembroIgreja[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchCadastros = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('membros_igreja')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (status) {
          query = query.eq('status', status);
        }

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setCadastros(data || []);
          setTotal(count || 0);
        }
      } catch (err) {
        setError('Erro ao buscar cadastros');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCadastros();
  }, [page, limit, status]);

  return {
    cadastros,
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

// Hook para estatísticas de cadastros
export const useCadastroStats = () => {
  const [stats, setStats] = React.useState({
    total: 0,
    pendentes: 0,
    contatados: 0,
    confirmados: 0,
    cancelados: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('membros_igreja')
        .select('status');

      if (!error && data) {
        setStats({
          total: data.length,
          pendentes: data.filter((c: MembroIgreja) => c.status === 'pendente').length,
          contatados: data.filter((c: MembroIgreja) => c.status === 'contatado').length,
          confirmados: data.filter((c: MembroIgreja) => c.status === 'confirmado').length,
          cancelados: data.filter((c: MembroIgreja) => c.status === 'cancelado').length,
        });
      }

      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};

