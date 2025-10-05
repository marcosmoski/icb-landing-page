import { useCriarCadastroMutation, useBuscarCadastrosQuery, useAtualizarCadastroMutation } from './cadastroApi';

// Hook customizado para funcionalidades de cadastro
export const useCadastro = () => {
  const [criarCadastro, createState] = useCriarCadastroMutation();
  const [atualizarCadastro, updateState] = useAtualizarCadastroMutation();

  return {
    // Mutations
    criarCadastro,
    atualizarCadastro,

    // Estados de loading
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,

    // Estados de erro
    createError: createState.error,
    updateError: updateState.error,

    // Estados de sucesso
    createSuccess: createState.isSuccess,
    updateSuccess: updateState.isSuccess,

    // Funções utilitárias
    resetCreateState: createState.reset,
    resetUpdateState: updateState.reset,
  };
};

// Hook para painel administrativo
export const useAdminCadastros = (page = 1, limit = 50, status?: string) => {
  const queryResult = useBuscarCadastrosQuery({ page, limit, status });

  return {
    ...queryResult,
    cadastros: queryResult.data?.cadastros || [],
    pagination: queryResult.data?.pagination || null,
    hasNextPage: queryResult.data?.pagination?.hasNext || false,
    hasPrevPage: queryResult.data?.pagination?.hasPrev || false,
  };
};

// Hook para estatísticas rápidas
export const useCadastroStats = () => {
  // Buscar todos os cadastros para estatísticas
  const { data, isLoading } = useBuscarCadastrosQuery({ limit: 1000 });

  const stats = data ? {
    total: data.pagination?.total || 0,
    pendentes: data.cadastros.filter(c => c.status === 'pendente').length,
    contatados: data.cadastros.filter(c => c.status === 'contatado').length,
    confirmados: data.cadastros.filter(c => c.status === 'confirmado').length,
    cancelados: data.cadastros.filter(c => c.status === 'cancelado').length,
  } : {
    total: 0,
    pendentes: 0,
    contatados: 0,
    confirmados: 0,
    cancelados: 0,
  };

  return {
    stats,
    isLoading,
  };
};
