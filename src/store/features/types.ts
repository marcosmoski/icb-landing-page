// Tipos centralizados para a aplicação

export interface Cadastro {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  mensagem?: string;
  status: 'pendente' | 'contatado' | 'confirmado' | 'cancelado';
  fonte: string;
  created_at: string;
  updated_at: string;
  contato_realizado_em?: string;
  observacoes?: string;
}

export interface CadastroLog {
  id: number;
  cadastro_id: number;
  acao: string;
  detalhes?: string;
  realizado_por: string;
  created_at: string;
}

export interface CadastroStats {
  total: number;
  pendentes: number;
  contatados: number;
  confirmados: number;
  cancelados: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CadastrosResponse {
  cadastros: Cadastro[];
  pagination: PaginationInfo;
}

// Estados de UI
export interface LoadingState {
  isLoading: boolean;
  isSubmitting?: boolean;
  isFetching?: boolean;
}

export interface ErrorState {
  error: string | null;
  errorDetails?: string[];
}

// Form states
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
}
