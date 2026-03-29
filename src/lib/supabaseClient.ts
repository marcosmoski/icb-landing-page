import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para a tabela membros_igreja
export interface MembroIgreja {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  mensagem?: string;
  batizado?: boolean;
  status?: 'pendente' | 'contatado' | 'confirmado' | 'cancelado';
  created_at?: string;
  updated_at?: string;
}

export type PedidoOracaoStatus = 'novo' | 'em_atendimento' | 'atendido' | 'encerrado';
export type PedidoOracaoVisita = 'sim' | 'nao' | 'visitar_igreja';

export interface PedidoOracao {
  id: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  data_nascimento?: string;
  batizado: boolean;
  pedido_oracao: string;
  visita_tipo: PedidoOracaoVisita;
  status: PedidoOracaoStatus;
  email_notificado_em?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrayerEmailPayload {
  nome: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
  batizado: boolean;
  pedidoOracao: string;
  visitaTipo: PedidoOracaoVisita;
  enviadoEm: string;
}
