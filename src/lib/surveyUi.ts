import type { SurveyFieldType, SurveyStatus } from './supabaseClient';

export const statusLabel: Record<SurveyStatus, string> = {
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Encerrada',
};

export const statusStyle: Record<SurveyStatus, string> = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
  open: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  closed: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
};

export const fieldTypeLabel: Record<SurveyFieldType, string> = {
  text: 'Texto curto',
  long_text: 'Texto longo',
  email: 'E-mail',
  phone: 'Telefone',
  date: 'Data',
  single_choice: 'Escolha única',
  multiple_choice: 'Múltipla escolha',
  yes_no: 'Sim / Não',
};

/** Tipos que têm lista de opções configurável. */
export const CHOICE_TYPES: SurveyFieldType[] = ['single_choice', 'multiple_choice'];

/** Tipos que rendem um resumo por opção na aba de respostas. */
export const SUMMARIZABLE_TYPES: SurveyFieldType[] = [...CHOICE_TYPES, 'yes_no'];
