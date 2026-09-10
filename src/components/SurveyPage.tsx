import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';
import 'react-phone-number-input/style.css';
import { useToast } from '@/hooks/useToast';
import {
  isRateLimitError,
  SURVEY_CLOSED_CODE,
  usePublicSurvey,
  useSubmitSurveyResponse,
} from '@/store/features/surveysHooks';
import type { SurveyAnswerValue, SurveyField } from '@/lib/supabaseClient';

type Answers = Record<string, SurveyAnswerValue>;

const emailSchema = z.email();

const GROUP_TYPES = ['single_choice', 'multiple_choice', 'yes_no'];

const isEmpty = (value: SurveyAnswerValue) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim().length === 0;
};

/** Valida um campo isolado; devolve a mensagem de erro ou null. */
const validateField = (field: SurveyField, value: SurveyAnswerValue): string | null => {
  if (isEmpty(value)) {
    return field.required ? 'Este campo é obrigatório.' : null;
  }

  if (field.type === 'email' && typeof value === 'string') {
    if (!emailSchema.safeParse(value.trim()).success) {
      return 'Informe um e-mail válido.';
    }
  }

  if (field.type === 'phone' && typeof value === 'string') {
    if (!isValidPhoneNumber(value)) {
      return 'Informe um telefone válido com o indicativo do país.';
    }
  }

  return null;
};

const SurveyShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#060a19] text-white relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,89,170,0.45),transparent_45%),radial-gradient(circle_at_75%_30%,rgba(164,189,255,0.2),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(22,33,76,0.6),transparent_55%)]" />
    <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</main>
  </div>
);

const SurveyCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative rounded-[28px] border border-slate-400/20 bg-[linear-gradient(145deg,rgba(14,21,44,0.95),rgba(6,10,25,0.94))] shadow-[0_24px_60px_rgba(2,6,23,0.7)] p-5 sm:p-8">
    {children}
  </div>
);

const ChurchLogo: React.FC = () => (
  <Link to="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity mb-4">
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
      <img src="/icblogo.png" alt="ICB Gaia" className="w-11 h-11 object-contain" />
    </span>
  </Link>
);

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-400/30 bg-slate-900/40 text-white placeholder:text-slate-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 [color-scheme:dark]';

const SurveyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { survey, isLoading, error } = usePublicSurvey(slug);
  const { submitResponse, isSubmitting } = useSubmitSurveyResponse();
  const { showToast } = useToast();

  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDone, setIsDone] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const fields = useMemo(() => survey?.fields || [], [survey]);

  const setAnswer = (fieldId: string, value: SurveyAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const toggleOption = (fieldId: string, option: string) => {
    const current = answers[fieldId];
    const selected = Array.isArray(current) ? current : [];
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    setAnswer(fieldId, next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!survey) return;

    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const message = validateField(field, answers[field.id] ?? null);
      if (message) {
        nextErrors[field.id] = message;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      // Num formulário longo no celular, o toast sozinho não diz para onde rolar.
      const firstInvalid = fields.find((field) => nextErrors[field.id]);
      if (firstInvalid) {
        const element = document.getElementById(`campo-${firstInvalid.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus({ preventScroll: true });
      }

      showToast({
        type: 'warning',
        title: 'Faltou preencher',
        message: 'Revise os campos destacados antes de enviar.',
        duration: 4000,
      });
      return;
    }

    // Guarda só o que foi preenchido, já normalizado.
    const payload: Answers = {};
    for (const field of fields) {
      const value = answers[field.id] ?? null;
      if (isEmpty(value)) continue;
      payload[field.id] = typeof value === 'string' ? value.trim() : value;
    }

    const { error: submitError } = await submitResponse(survey.id, payload);

    if (submitError) {
      // A pesquisa pode ter sido encerrada entre abrir o formulário e enviar:
      // a RLS recusa o insert. Nesse caso "tentar de novo" nunca vai funcionar.
      if (submitError.code === SURVEY_CLOSED_CODE) {
        setIsClosed(true);
        return;
      }

      showToast({
        type: 'error',
        title: isRateLimitError(submitError.message) ? 'Muita gente enviando agora' : 'Não foi possível enviar',
        message: isRateLimitError(submitError.message)
          ? 'Aguarde alguns segundos e toque em enviar novamente. Suas respostas continuam aqui.'
          : 'Tente novamente em instantes. Se persistir, fale com a equipe.',
        duration: 5000,
      });
      return;
    }

    setIsDone(true);
  };

  if (isLoading) {
    return (
      <SurveyShell>
        <SurveyCard>
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4" />
            <p className="text-slate-300">Carregando pesquisa...</p>
          </div>
        </SurveyCard>
      </SurveyShell>
    );
  }

  // A RPC devolve apenas pesquisas abertas, então "não encontrada" cobre
  // slug inexistente, rascunho e pesquisa encerrada.
  if (error || !survey || isClosed) {
    return (
      <SurveyShell>
        <SurveyCard>
          <div className="py-12 text-center">
            <ChurchLogo />
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100">
              {isClosed ? 'Esta pesquisa acabou de ser encerrada' : 'Esta pesquisa não está disponível'}
            </h1>
            <p className="text-slate-300/85 mt-3 max-w-md mx-auto leading-relaxed">
              {isClosed
                ? 'Ela deixou de aceitar respostas enquanto você preenchia. Se precisar, fale com a equipe da igreja.'
                : 'Ela pode ter sido encerrada ou o link pode estar incorreto. Se você acha que é engano, fale com a equipe da igreja.'}
            </p>
            <Link
              to="/"
              className="inline-flex mt-6 px-5 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 transition"
            >
              Voltar para a home
            </Link>
          </div>
        </SurveyCard>
      </SurveyShell>
    );
  }

  if (isDone) {
    return (
      <SurveyShell>
        <SurveyCard>
          <div className="py-12 text-center">
            <ChurchLogo />
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <svg className="h-7 w-7 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100">Resposta enviada!</h1>
            <p className="text-slate-300/85 mt-3 max-w-md mx-auto leading-relaxed">
              {survey.thank_you_message || 'Obrigado por participar. Sua resposta foi registrada.'}
            </p>
            <Link
              to="/"
              className="inline-flex mt-6 px-5 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 transition"
            >
              Voltar para a home
            </Link>
          </div>
        </SurveyCard>
      </SurveyShell>
    );
  }

  return (
    <SurveyShell>
      <SurveyCard>
        <Link
          to="/"
          className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm"
        >
          Voltar
        </Link>

        <header className="mb-8 text-center pt-6 sm:pt-2">
          <ChurchLogo />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-slate-300/85 mt-3 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              {survey.description}
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {fields.map((field) => (
            <SurveyFieldInput
              key={field.id}
              field={field}
              value={answers[field.id] ?? null}
              error={errors[field.id]}
              onChange={(value) => setAnswer(field.id, value)}
              onToggleOption={(option) => toggleOption(field.id, option)}
            />
          ))}

          {fields.length === 0 ? (
            <p className="text-center text-slate-300/85 py-6">
              Esta pesquisa ainda não tem perguntas configuradas.
            </p>
          ) : (
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#567bc7] to-[#6f94df] text-white font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar resposta'}
              </button>
            </div>
          )}

          <p className="text-slate-300/85 text-sm text-center">
            Usamos suas respostas apenas para a organização interna da igreja. Veja nossa{' '}
            <Link to="/privacidade" className="underline hover:text-white">
              política de privacidade
            </Link>
            .
          </p>
        </form>
      </SurveyCard>
    </SurveyShell>
  );
};

interface SurveyFieldInputProps {
  field: SurveyField;
  value: SurveyAnswerValue;
  error?: string;
  onChange: (value: SurveyAnswerValue) => void;
  onToggleOption: (option: string) => void;
}

const RequiredMark: React.FC = () => (
  <>
    <span aria-hidden="true" className="text-blue-300">*</span>
    <span className="sr-only">obrigatório</span>
  </>
);

const CheckIcon: React.FC = () => (
  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SurveyFieldInput: React.FC<SurveyFieldInputProps> = ({
  field,
  value,
  error,
  onChange,
  onToggleOption,
}) => {
  const controlId = `campo-${field.id}`;
  const errorId = `erro-${field.id}`;
  const selectedList = Array.isArray(value) ? value : [];
  const isGroup = GROUP_TYPES.includes(field.type);
  const isMultiple = field.type === 'multiple_choice';

  const a11y = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  } as const;

  const renderControl = () => {
    switch (field.type) {
      case 'long_text':
        return (
          <textarea
            id={controlId}
            rows={4}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Escreva sua resposta"
            {...a11y}
          />
        );

      case 'email':
        return (
          <input
            id={controlId}
            type="email"
            inputMode="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            placeholder="seunome@email.com"
            {...a11y}
          />
        );

      case 'phone':
        return (
          <PhoneInput
            id={controlId}
            international
            defaultCountry="PT"
            countryCallingCodeEditable={false}
            value={typeof value === 'string' && value ? value : undefined}
            onChange={(phone) => onChange(phone || '')}
            placeholder="+351 ..."
            className="phone-input-custom"
            {...a11y}
          />
        );

      case 'date':
        return (
          <input
            id={controlId}
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            {...a11y}
          />
        );

      case 'yes_no':
        return (
          <div className="grid grid-cols-2 gap-3" role="radiogroup" {...a11y}>
            {['Sim', 'Não'].map((option, index) => {
              const isSelected = value === option;
              return (
                <button
                  key={option}
                  id={index === 0 ? controlId : undefined}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange(option)}
                  className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    isSelected
                      ? 'border-blue-400/60 bg-blue-500/20 text-white'
                      : 'border-slate-400/25 bg-slate-900/40 text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      case 'single_choice':
      case 'multiple_choice':
        return (
          <div
            className="space-y-2.5"
            role={isMultiple ? 'group' : 'radiogroup'}
            {...a11y}
          >
            {(field.options || []).map((option, index) => {
              const isSelected = isMultiple ? selectedList.includes(option) : value === option;

              return (
                <button
                  key={option}
                  id={index === 0 ? controlId : undefined}
                  type="button"
                  role={isMultiple ? 'checkbox' : 'radio'}
                  aria-checked={isSelected}
                  onClick={() => (isMultiple ? onToggleOption(option) : onChange(option))}
                  className={`w-full min-h-[52px] flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-blue-400/60 bg-blue-500/15 shadow-[0_0_0_1px_rgba(96,165,250,0.25)]'
                      : 'border-slate-400/25 bg-slate-900/40 hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border transition ${
                      isMultiple ? 'rounded-md' : 'rounded-full'
                    } ${isSelected ? 'border-blue-300 bg-blue-500' : 'border-slate-400/50 bg-transparent'}`}
                  >
                    {isSelected && <CheckIcon />}
                  </span>
                  <span className="text-slate-100">{option}</span>
                </button>
              );
            })}
          </div>
        );

      case 'text':
      default:
        return (
          <input
            id={controlId}
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            placeholder="Escreva sua resposta"
            {...a11y}
          />
        );
    }
  };

  // Múltipla escolha precisa dizer que aceita mais de uma: o quadrado vs. círculo é sutil demais.
  const helpText =
    field.description || (isMultiple ? 'Pode escolher mais de uma opção.' : undefined);

  const containerClass = `rounded-2xl border p-4 sm:p-5 transition ${
    error ? 'border-red-400/50 bg-red-500/5' : 'border-slate-400/15 bg-slate-900/25'
  }`;

  const labelContent = (
    <>
      {field.label} {field.required && <RequiredMark />}
    </>
  );

  const body = (
    <>
      {helpText && <p className="text-slate-300/80 text-sm mb-3">{helpText}</p>}
      <div className={helpText ? '' : 'mt-3'}>{renderControl()}</div>
      {error && (
        <p id={errorId} className="text-red-300 text-sm mt-2">
          {error}
        </p>
      )}
    </>
  );

  if (isGroup) {
    return (
      <fieldset className={containerClass}>
        <legend className="text-sm font-medium text-slate-100 mb-1">{labelContent}</legend>
        {body}
      </fieldset>
    );
  }

  return (
    <div className={containerClass}>
      <label htmlFor={controlId} className="block text-sm font-medium text-slate-100 mb-1">
        {labelContent}
      </label>
      {body}
    </div>
  );
};

export default SurveyPage;
