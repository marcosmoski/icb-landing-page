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

// ========================================
// Pesquisas (surveys) - formulários dinâmicos
// ========================================

export type SurveyStatus = 'draft' | 'open' | 'closed';

export type SurveyFieldType =
  | 'text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'date'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no';

export interface SurveyField {
  id: string;
  type: SurveyFieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  fields: SurveyField[];
  status: SurveyStatus;
  thank_you_message?: string | null;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Campos que o admin pode alterar. Restringe `id`/`created_at`, que nunca devem ir no update.
 */
export type SurveyUpdate = Partial<
  Pick<Survey, 'title' | 'description' | 'fields' | 'status' | 'thank_you_message' | 'closed_at'>
>;

/**
 * O que a RPC `get_open_survey` devolve para quem abre o link.
 * Sem datas nem campos internos: o público não precisa deles.
 */
export type PublicSurvey = Pick<
  Survey,
  'id' | 'slug' | 'title' | 'description' | 'fields' | 'status' | 'thank_you_message'
>;

export type SurveyAnswerValue = string | string[] | null;

export interface SurveyResponse {
  id: number;
  survey_id: string;
  answers: Record<string, SurveyAnswerValue>;
  created_at?: string;
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
