import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  Survey,
  SurveyAnswerValue,
  SurveyField,
  SurveyResponse,
  SurveyStatus,
} from '@/lib/supabaseClient';

const SURVEYS_TABLE = 'surveys';
const RESPONSES_TABLE = 'survey_responses';

/** Gera um slug amigável para a URL pública a partir do título. */
export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Id estável do campo, usado como chave em `answers`. */
export const createFieldId = () => `campo_${Math.random().toString(36).slice(2, 9)}`;

// ========================================
// Público
// ========================================

/** Carrega uma pesquisa aberta pelo slug. A RLS só devolve pesquisas com status `open`. */
export const usePublicSurvey = (slug?: string) => {
  const [survey, setSurvey] = React.useState<Survey | null>(null);
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

      const { data, error: fetchError } = await supabase
        .from(SURVEYS_TABLE)
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!active) {
        return;
      }

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
  }, [slug]);

  return { survey, isLoading, error };
};

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
    const fetchSurveys = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(SURVEYS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      const { data: responses } = await supabase.from(RESPONSES_TABLE).select('survey_id');

      const counts = new Map<string, number>();
      for (const row of (responses as Array<{ survey_id: string }>) || []) {
        counts.set(row.survey_id, (counts.get(row.survey_id) || 0) + 1);
      }

      setSurveys(
        ((data as Survey[]) || []).map((survey) => ({
          ...survey,
          responseCount: counts.get(survey.id) || 0,
        }))
      );
      setIsLoading(false);
    };

    fetchSurveys();
  }, [refreshKey]);

  return { surveys, isLoading, error };
};

/** Carrega uma pesquisa pelo id, independente do status (requer admin logado). */
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

    const fetchSurvey = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(SURVEYS_TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSurvey((data as Survey) || null);
      }

      setIsLoading(false);
    };

    fetchSurvey();
  }, [id, refreshKey]);

  return { survey, isLoading, error };
};

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

    const fetchResponses = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(RESPONSES_TABLE)
        .select('*')
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setResponses((data as SurveyResponse[]) || []);
      }

      setIsLoading(false);
    };

    fetchResponses();
  }, [surveyId, refreshKey]);

  return { responses, isLoading, error };
};

interface CreateSurveyInput {
  title: string;
  description?: string;
  slug: string;
  fields?: SurveyField[];
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
          fields: input.fields || [],
          thank_you_message: input.thank_you_message || null,
          status: 'draft',
        },
      ])
      .select()
      .maybeSingle();

    setIsSaving(false);
    return { data: data as Survey | null, error };
  };

  const updateSurvey = async (id: string, updates: Partial<Survey>) => {
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
    const { error } = await supabase.from(RESPONSES_TABLE).delete().eq('id', id);
    return { error };
  };

  return { createSurvey, updateSurvey, changeStatus, deleteSurvey, deleteResponse, isSaving };
};
