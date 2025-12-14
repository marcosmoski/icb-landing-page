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
  status?: 'pendente' | 'contatado' | 'confirmado' | 'cancelado';
  created_at?: string;
  updated_at?: string;
}
