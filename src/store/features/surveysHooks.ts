import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  PublicSurvey,
  Survey,
  SurveyAnswerValue,
  SurveyResponse,
  SurveyStatus,
  SurveyUpdate,
} from '@/lib/supabaseClient';

const SURVEYS_TABLE = 'surveys';
const RESPONSES_TABLE = 'survey_responses';

/** O PostgREST corta em 1000 linhas por requisição; buscamos em páginas desse tamanho. */
const PAGE_SIZE = 1000;

/** Gera um slug amigável a partir do título (sem o token secreto). */
export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

/**
 * A pesquisa não é pública: quem tem o link responde. Por isso o slug carrega um
 * token aleatório — sem ele, o endereço seria adivinhável a partir do título.
 */
export const createSurveySlug = (title: string) => {
  const base = slugify(title) || 'pesquisa';
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  return `${base}-${token}`;
};

/** Id estável do campo, usado como chave em `answers`. */
export const createFieldId = () =>
  `campo_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;

// ========================================
// Público
// ========================================

/**
 * Carrega uma pesquisa aberta pelo slug via RPC `get_open_survey`.
 * O anon não tem SELECT na tabela: só esta função devolve dados, e só com o slug exato.
 */
export const usePublicSurvey = (slug?: string) => {
  const [survey, setSurvey] = React.useState<PublicSurvey | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) {
      setSurvey(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchSurvey = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_open_survey', {
        p_slug: slug,
      });

      if (!active) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
      } else {
        const rows = (data as PublicSurvey[]) || [];
        setSurvey(rows[0] || null);
      }

      setIsLoading(false);
    };

    fetchSurvey();

    return () => {
      active = false;
    };
  }, [slug]);

  return { survey, isLoading, error };
};

/** Erro devolvido quando a pesquisa foi encerrada entre abrir o formulário e enviar. */
export const SURVEY_CLOSED_CODE = '42501';

/** Erro do gatilho anti-flood do banco. */
export const isRateLimitError = (message?: string) =>
  Boolean(message && message.includes('survey_rate_limit'));

export const useSubmitSurveyResponse = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitResponse = async (
    surveyId: string,
    answers: Record<string, SurveyAnswerValue>
  ) => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from(RESPONSES_TABLE)
      .insert([{ survey_id: surveyId, answers }]);

    setIsSubmitting(false);
    return { error };
  };

  return { submitResponse, isSubmitting };
};

// ========================================
// Admin
// ========================================

export interface SurveyWithCount extends Survey {
  responseCount: number;
}

/** Lista todas as pesquisas (qualquer status) com o total de respostas de cada uma. */
export const useAdminSurveys = (refreshKey = 0) => {
  const [surveys, setSurveys] = React.useState<SurveyWithCount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const fetchSurveys = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(SURVEYS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      const rows = (data as Survey[]) || [];

      // `head: true` conta no servidor, sem trazer as linhas (nem esbarrar no limite de 1000).
      const counts = await Promise.all(
        rows.map(async (survey) => {
          const { count } = await supabase
            .from(RESPONSES_TABLE)
            .select('id', { count: 'exact', head: true })
            .eq('survey_id', survey.id);

          return count || 0;
        })
      );

      if (!active) return;

      setSurveys(rows.map((survey, index) => ({ ...survey, responseCount: counts[index] })));
      setIsLoading(false);
    };

    fetchSurveys();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { surveys, isLoading, error };
};

/** Carrega uma pesquisa pelo id, independente do status (requer admin). */
export const useAdminSurvey = (id?: string, refreshKey = 0) => {
  const [survey, setSurvey] = React.useState<Survey | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setSurvey(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchSurvey = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(SURVEYS_TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSurvey((data as Survey) || null);
      }

      setIsLoading(false);
    };

    fetchSurvey();

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  return { survey, isLoading, error };
};

/**
 * Traz todas as respostas de uma pesquisa, em páginas de 1000.
 * O resumo e o CSV precisam do conjunto completo, senão mostram números errados em silêncio.
 */
export const useSurveyResponses = (surveyId?: string, refreshKey = 0) => {
  const [responses, setResponses] = React.useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!surveyId) {
      setResponses([]);
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchResponses = async () => {
      setIsLoading(true);
      setError(null);

      const collected: SurveyResponse[] = [];

      for (let page = 0; ; page += 1) {
        const { data, error: fetchError } = await supabase
          .from(RESPONSES_TABLE)
          .select('*')
          .eq('survey_id', surveyId)
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (!active) return;

        if (fetchError) {
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        const rows = (data as SurveyResponse[]) || [];
        collected.push(...rows);

        if (rows.length < PAGE_SIZE) break;
      }

      if (!active) return;

      setResponses(collected);
      setIsLoading(false);
    };

    fetchResponses();

    return () => {
      active = false;
    };
  }, [surveyId, refreshKey]);

  return { responses, isLoading, error };
};

interface CreateSurveyInput {
  title: string;
  description?: string;
  slug: string;
  thank_you_message?: string;
}

export const useSurveyMutations = () => {
  const [isSaving, setIsSaving] = React.useState(false);

  const createSurvey = async (input: CreateSurveyInput) => {
    setIsSaving(true);

    const { data, error } = await supabase
      .from(SURVEYS_TABLE)
      .insert([
        {
          title: input.title,
          description: input.description || null,
          slug: input.slug,
          fields: [],
          thank_you_message: input.thank_you_message || null,
          status: 'draft',
        },
      ])
      .select()
      .maybeSingle();

    setIsSaving(false);
    return { data: data as Survey | null, error };
  };

  const updateSurvey = async (id: string, updates: SurveyUpdate) => {
    setIsSaving(true);

    const { data, error } = await supabase
      .from(SURVEYS_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    setIsSaving(false);
    return { data: data as Survey | null, error };
  };

  const changeStatus = async (id: string, status: SurveyStatus) =>
    updateSurvey(id, {
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
    });

  const deleteSurvey = async (id: string) => {
    setIsSaving(true);
    const { error } = await supabase.from(SURVEYS_TABLE).delete().eq('id', id);
    setIsSaving(false);
    return { error };
  };

  const deleteResponse = async (id: number) => {
    setIsSaving(true);
    const { error } = await supabase.from(RESPONSES_TABLE).delete().eq('id', id);
    setIsSaving(false);
    return { error };
  };

  return { createSurvey, updateSurvey, changeStatus, deleteSurvey, deleteResponse, isSaving };
};
