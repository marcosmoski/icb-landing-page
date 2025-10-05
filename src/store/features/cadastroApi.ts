import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Cadastro, CadastrosResponse } from './types';

// Tipos para a API de cadastro
export interface CadastroRequest {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento?: string;
  mensagem?: string;
}

export interface CadastroResponse {
  success: boolean;
  message: string;
  cadastroId?: number;
  error?: string;
  details?: string[];
}

export interface CadastroError {
  error: string;
  details?: string[];
  message?: string;
  retryAfter?: number;
}

// Parâmetros para buscar cadastros
export interface BuscarCadastrosParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Parâmetros para atualizar cadastro
export interface AtualizarCadastroParams {
  id: number;
  status?: Cadastro['status'];
  observacoes?: string;
}

// API do RTK Query para cadastros
export const cadastroApi = createApi({
  reducerPath: 'cadastroApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/', // URLs relativas para Pages Functions
    // Adicionar headers padrão se necessário
    prepareHeaders: (headers) => {
      // Adicionar auth token se necessário para endpoints protegidos
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Mutation para criar cadastro
    criarCadastro: builder.mutation<CadastroResponse, CadastroRequest>({
      query: (cadastroData) => ({
        url: 'api/cadastro',
        method: 'POST',
        body: cadastroData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      // Configurações adicionais
      extraOptions: {
        // Não cachear mutations por padrão
        cacheTime: 0,
      },
    }),

    // Query para buscar cadastros (para admin)
    buscarCadastros: builder.query<CadastrosResponse, BuscarCadastrosParams>({
      query: ({ page = 1, limit = 50, status } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append('status', status);

        return {
          url: `api/admin/cadastros?${params.toString()}`,
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_ADMIN_TOKEN || 'admin-token-temporario'}`,
          },
        };
      },
      // Cache por 5 minutos
      keepUnusedDataFor: 300,
    }),

    // Mutation para atualizar cadastro (para admin)
    atualizarCadastro: builder.mutation<CadastroResponse, AtualizarCadastroParams>({
      query: ({ id, ...updateData }) => ({
        url: `api/admin/cadastros/${id}`,
        method: 'PUT',
        body: updateData,
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_ADMIN_TOKEN || 'admin-token-temporario'}`,
          'Content-Type': 'application/json',
        },
      }),
      // Invalidar cache após atualização
      // invalidatesTags: ['Cadastro'],
    }),
  }),
});

// Exportar hooks gerados automaticamente
export const {
  useCriarCadastroMutation,
  useBuscarCadastrosQuery,
  useLazyBuscarCadastrosQuery,
  useAtualizarCadastroMutation,
} = cadastroApi;

// Tipos de cache tags para invalidação
export const cadastroTags = {
  list: 'LIST' as const,
  detail: 'DETAIL' as const,
} as const;
