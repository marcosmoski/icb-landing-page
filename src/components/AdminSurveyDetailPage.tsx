import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { useToast } from '@/hooks/useToast';
import {
  CHOICE_TYPES,
  fieldTypeLabel,
  statusLabel,
  statusStyle,
  SUMMARIZABLE_TYPES,
} from '@/lib/surveyUi';
import {
  createFieldId,
  useAdminSurvey,
  useSurveyMutations,
  useSurveyResponses,
} from '@/store/features/surveysHooks';
import type {
  Survey,
  SurveyAnswerValue,
  SurveyField,
  SurveyFieldType,
  SurveyResponse,
  SurveyStatus,
} from '@/lib/supabaseClient';

const formatAnswer = (value: SurveyAnswerValue): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
};

const AdminSurveyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'perguntas' | 'respostas'>('perguntas');

  const { survey, isLoading, error } = useAdminSurvey(id, refreshKey);
  const { responses, isLoading: responsesLoading } = useSurveyResponses(id, refreshKey);
  const { updateSurvey, changeStatus, deleteResponse, isSaving } = useSurveyMutations();

  const [draft, setDraft] = useState<Survey | null>(null);

  /**
   * O rascunho só é re-semeado quando a pesquisa muda de verdade no servidor.
   * Sem isso, qualquer refetch (apagar uma resposta, mudar o status) apagaria em
   * silêncio as perguntas que o admin acabou de editar.
   */
  const seededFrom = useRef<string | null>(null);

  useEffect(() => {
    if (!survey) {
      setDraft(null);
      seededFrom.current = null;
      return;
    }

    const signature = `${survey.id}:${survey.updated_at ?? ''}`;
    if (seededFrom.current === signature) return;

    seededFrom.current = signature;
    setDraft({ ...survey, fields: survey.fields.map((field) => ({ ...field })) });
  }, [survey]);

  const isDirty = useMemo(() => {
    if (!survey || !draft) return false;
    return (
      survey.title !== draft.title ||
      (survey.description || '') !== (draft.description || '') ||
      (survey.thank_you_message || '') !== (draft.thank_you_message || '') ||
      JSON.stringify(survey.fields) !== JSON.stringify(draft.fields)
    );
  }, [survey, draft]);

  /** Pede confirmação antes de qualquer navegação que descartaria edições. */
  const confirmDiscard = () =>
    !isDirty || window.confirm('Você tem alterações não salvas. Sair mesmo assim?');

  const publicUrl = survey ? `${window.location.origin}/pesquisa/${survey.slug}` : '';

  const updateDraft = (updates: Partial<Survey>) =>
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));

  const updateField = (fieldId: string, updates: Partial<SurveyField>) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            fields: prev.fields.map((field) =>
              field.id === fieldId ? { ...field, ...updates } : field
            ),
          }
        : prev
    );

  const addField = () =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            fields: [
              ...prev.fields,
              { id: createFieldId(), type: 'text', label: '', required: true },
            ],
          }
        : prev
    );

  const removeField = (fieldId: string) =>
    setDraft((prev) =>
      prev ? { ...prev, fields: prev.fields.filter((field) => field.id !== fieldId) } : prev
    );

  const moveField = (index: number, direction: -1 | 1) =>
    setDraft((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.fields.length) return prev;

      const fields = [...prev.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...prev, fields };
    });

  const handleSave = async () => {
    if (!draft || !id || !survey) return;

    const invalid = draft.fields.find((field) => !field.label.trim());
    if (invalid) {
      showToast({
        type: 'warning',
        title: 'Pergunta sem título',
        message: 'Todas as perguntas precisam de um enunciado.',
        duration: 4000,
      });
      return;
    }

    const missingOptions = draft.fields.find(
      (field) =>
        CHOICE_TYPES.includes(field.type) &&
        new Set((field.options || []).map((option) => option.trim()).filter(Boolean)).size < 2
    );
    if (missingOptions) {
      showToast({
        type: 'warning',
        title: 'Opções insuficientes',
        message: `"${missingOptions.label}" precisa de pelo menos 2 opções diferentes.`,
        duration: 4500,
      });
      return;
    }

    // Remover uma pergunta não apaga as respostas dela: elas continuam gravadas,
    // mas somem da tabela e do CSV. O admin precisa saber disso antes de salvar.
    if (responses.length > 0) {
      const draftIds = new Set(draft.fields.map((field) => field.id));
      const removed = survey.fields.filter((field) => !draftIds.has(field.id));

      if (removed.length > 0) {
        const names = removed.map((field) => `"${field.label}"`).join(', ');
        const confirmed = window.confirm(
          `Você removeu ${names}. As ${responses.length} respostas já enviadas continuam no banco, ` +
            'mas deixam de aparecer na tabela e no CSV. Exporte o CSV antes, se precisar delas. Salvar mesmo assim?'
        );
        if (!confirmed) return;
      }
    }

    // Limpa opções vazias/repetidas e campos que não se aplicam ao tipo escolhido.
    const cleanFields: SurveyField[] = draft.fields.map((field) => ({
      id: field.id,
      type: field.type,
      label: field.label.trim(),
      required: field.required,
      ...(field.description?.trim() ? { description: field.description.trim() } : {}),
      ...(CHOICE_TYPES.includes(field.type)
        ? {
            options: Array.from(
              new Set((field.options || []).map((option) => option.trim()).filter(Boolean))
            ),
          }
        : {}),
    }));

    const { error: saveError } = await updateSurvey(id, {
      title: draft.title.trim(),
      description: draft.description?.trim() || null,
      thank_you_message: draft.thank_you_message?.trim() || null,
      fields: cleanFields,
    });

    if (saveError) {
      showToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: saveError.message,
        duration: 5000,
      });
      return;
    }

    showToast({ type: 'success', title: 'Pesquisa salva', duration: 3000 });
    setRefreshKey((prev) => prev + 1);
  };

  const handleStatusChange = async (status: SurveyStatus) => {
    if (!id || !survey) return;

    if (isDirty) {
      showToast({
        type: 'warning',
        title: 'Salve primeiro',
        message: 'Salve as alterações das perguntas antes de mudar o status.',
        duration: 4000,
      });
      return;
    }

    if (status === 'open' && survey.fields.length === 0) {
      showToast({
        type: 'warning',
        title: 'Sem perguntas',
        message: 'Adicione e salve pelo menos uma pergunta antes de publicar.',
        duration: 4500,
      });
      return;
    }

    if (status === 'closed' && !window.confirm('Encerrar a pesquisa? Ela deixa de aceitar respostas.')) {
      return;
    }

    const { error: statusError } = await changeStatus(id, status);

    if (statusError) {
      showToast({
        type: 'error',
        title: 'Erro ao mudar o status',
        message: statusError.message,
        duration: 5000,
      });
      return;
    }

    showToast({
      type: 'success',
      title:
        status === 'open'
          ? 'Pesquisa publicada'
          : status === 'closed'
            ? 'Pesquisa encerrada'
            : 'Voltou para rascunho',
      duration: 3000,
    });
    setRefreshKey((prev) => prev + 1);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast({ type: 'success', title: 'Link copiado', duration: 2500 });
    } catch {
      showToast({
        type: 'warning',
        title: 'Não foi possível copiar',
        message: publicUrl,
        duration: 6000,
      });
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (!window.confirm('Apagar esta resposta?')) return;

    const { error: deleteError } = await deleteResponse(responseId);

    if (deleteError) {
      showToast({ type: 'error', title: 'Erro ao apagar', message: deleteError.message, duration: 5000 });
      return;
    }

    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <AdminHeader subtitle="Pesquisas" />
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-white/70">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (error || !survey || !draft) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <AdminHeader subtitle="Pesquisas" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-red-300 mb-2">Pesquisa não encontrada</p>
          <p className="text-white/60 mb-6">{error || 'O link pode estar incorreto.'}</p>
          <Link to="/admin/pesquisas" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            Voltar para pesquisas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader subtitle="Pesquisas" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <button
          onClick={() => confirmDiscard() && navigate('/admin/pesquisas')}
          className="text-white/60 hover:text-white text-sm"
        >
          ← Todas as pesquisas
        </button>

        <div className="mt-4 card bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold">{survey.title}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${statusStyle[survey.status]}`}
                >
                  {statusLabel[survey.status]}
                </span>
              </div>

              {survey.status === 'open' ? (
                <>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <code className="text-xs sm:text-sm text-blue-200 bg-blue-500/10 border border-blue-400/20 rounded-lg px-2.5 py-1.5 break-all">
                      {publicUrl}
                    </code>
                    <button
                      onClick={copyLink}
                      className="min-h-[40px] px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-colors"
                    >
                      Copiar link
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mt-2">
                    Link privado: só quem recebe consegue abrir. Não aparece em busca nem em lista pública.
                  </p>
                </>
              ) : (
                <p className="text-white/55 text-sm mt-2">
                  {survey.status === 'draft'
                    ? 'Publique a pesquisa para gerar o link.'
                    : `Encerrada${survey.closed_at ? ` em ${new Date(survey.closed_at).toLocaleString('pt-PT')}` : ''}. O link não aceita mais respostas.`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {survey.status !== 'open' && (
                <button
                  onClick={() => handleStatusChange('open')}
                  disabled={isSaving}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-emerald-600/25 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/35 text-sm font-medium transition-colors"
                >
                  {survey.status === 'draft' ? 'Publicar' : 'Reabrir'}
                </button>
              )}

              {survey.status === 'open' && (
                <button
                  onClick={() => handleStatusChange('closed')}
                  disabled={isSaving}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-200 hover:bg-amber-600/30 text-sm font-medium transition-colors"
                >
                  Encerrar pesquisa
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6 mb-6" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'perguntas'}
            onClick={() => setActiveTab('perguntas')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'perguntas' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Perguntas
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'respostas'}
            onClick={() => confirmDiscard() && setActiveTab('respostas')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'respostas' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Respostas ({responses.length})
          </button>
        </div>

        {activeTab === 'perguntas' ? (
          <div className="space-y-5 pb-24">
            <div className="card bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-white/80 mb-2">
                  Título da pesquisa
                </label>
                <input
                  id="titulo"
                  value={draft.title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-white/80 mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  rows={2}
                  value={draft.description || ''}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>

              <div>
                <label htmlFor="agradecimento" className="block text-sm font-medium text-white/80 mb-2">
                  Mensagem de agradecimento (após enviar)
                </label>
                <input
                  id="agradecimento"
                  value={draft.thank_you_message || ''}
                  onChange={(e) => updateDraft({ thank_you_message: e.target.value })}
                  placeholder="Obrigado por participar!"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>
            </div>

            {draft.fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={index}
                total={draft.fields.length}
                onChange={(updates) => updateField(field.id, updates)}
                onRemove={() => removeField(field.id)}
                onMove={(direction) => moveField(index, direction)}
              />
            ))}

            <button
              onClick={addField}
              className="w-full py-4 rounded-2xl border border-dashed border-white/25 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition"
            >
              + Adicionar pergunta
            </button>

            <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900/90 backdrop-blur p-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#567bc7] to-[#6f94df] font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <span className="text-white/55 text-sm">
                {isDirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}
              </span>
            </div>
          </div>
        ) : (
          <ResponsesTab
            survey={survey}
            responses={responses}
            isLoading={responsesLoading}
            onDelete={handleDeleteResponse}
          />
        )}
      </main>
    </div>
  );
};

// ========================================
// Editor de uma pergunta
// ========================================

interface FieldEditorProps {
  field: SurveyField;
  index: number;
  total: number;
  onChange: (updates: Partial<SurveyField>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

const toolButtonClass =
  'min-h-[40px] min-w-[40px] px-3 py-2 rounded-lg text-sm transition-colors inline-flex items-center justify-center';

const FieldEditor: React.FC<FieldEditorProps> = ({ field, index, total, onChange, onRemove, onMove }) => {
  const isChoice = CHOICE_TYPES.includes(field.type);
  const options = field.options || [];
  const position = index + 1;

  const handleTypeChange = (type: SurveyFieldType) => {
    // Ao virar escolha, já sugere duas opções vazias para preencher.
    if (CHOICE_TYPES.includes(type) && options.length === 0) {
      onChange({ type, options: ['', ''] });
      return;
    }
    onChange({ type });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const next = [...options];
    next[optionIndex] = value;
    onChange({ options: next });
  };

  return (
    <div className="card bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-white/45 text-sm font-medium pt-2">Pergunta {position}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Mover a pergunta ${position} para cima`}
            className={`${toolButtonClass} bg-white/10 hover:bg-white/20 disabled:opacity-30`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Mover a pergunta ${position} para baixo`}
            className={`${toolButtonClass} bg-white/10 hover:bg-white/20 disabled:opacity-30`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className={`${toolButtonClass} bg-red-600/20 hover:bg-red-600/30 text-red-300`}
          >
            Remover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            htmlFor={`enunciado-${field.id}`}
            className="block text-xs font-medium text-white/60 mb-1.5"
          >
            Enunciado da pergunta
          </label>
          <input
            id={`enunciado-${field.id}`}
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Ex.: Em quais áreas gostaria de servir?"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>

        <div>
          <label htmlFor={`tipo-${field.id}`} className="block text-xs font-medium text-white/60 mb-1.5">
            Tipo de resposta
          </label>
          <select
            id={`tipo-${field.id}`}
            value={field.type}
            onChange={(e) => handleTypeChange(e.target.value as SurveyFieldType)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            {(Object.keys(fieldTypeLabel) as SurveyFieldType[]).map((type) => (
              <option key={type} value={type} className="bg-gray-900">
                {fieldTypeLabel[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`ajuda-${field.id}`} className="block text-xs font-medium text-white/60 mb-1.5">
          Texto de ajuda (opcional)
        </label>
        <input
          id={`ajuda-${field.id}`}
          value={field.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Aparece abaixo do enunciado, em letra menor"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white/90 text-sm placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        />
      </div>

      {isChoice && (
        <div className="mt-4 space-y-2">
          <span className="block text-sm font-medium text-white/70">Opções</span>

          {options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <input
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
                aria-label={`Opção ${optionIndex + 1} da pergunta ${position}`}
                placeholder={`Opção ${optionIndex + 1}`}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <button
                onClick={() => onChange({ options: options.filter((_, i) => i !== optionIndex) })}
                aria-label={`Remover a opção ${optionIndex + 1}`}
                className={`${toolButtonClass} bg-white/10 hover:bg-red-600/30 text-white/70 hover:text-red-200`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={() => onChange({ options: [...options, ''] })}
            className="inline-flex items-center gap-1 min-h-[40px] px-3 py-2 rounded-lg border border-dashed border-blue-400/30 text-sm text-blue-300 hover:bg-blue-500/10 transition-colors"
          >
            + Adicionar opção
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 mt-4 py-2 -my-0.5 text-sm text-white/75 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onChange({ required: e.target.checked })}
          className="h-5 w-5 rounded border-white/30 bg-transparent accent-blue-500"
        />
        Resposta obrigatória
      </label>
    </div>
  );
};

// ========================================
// Aba de respostas
// ========================================

interface ResponsesTabProps {
  survey: Survey;
  responses: SurveyResponse[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

/**
 * Excel e LibreOffice avaliam células que começam com = + - @ como fórmula,
 * mesmo entre aspas. Como o texto vem de fora, prefixamos uma aspa simples.
 */
const csvEscape = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

const ResponsesTab: React.FC<ResponsesTabProps> = ({ survey, responses, isLoading, onDelete }) => {
  /**
   * Chaves gravadas nas respostas que não correspondem a nenhuma pergunta atual
   * (a pergunta foi removida depois). Mostramos como coluna extra para os dados
   * não sumirem em silêncio.
   */
  const orphanKeys = useMemo(() => {
    const known = new Set(survey.fields.map((field) => field.id));
    const found = new Set<string>();

    for (const response of responses) {
      for (const key of Object.keys(response.answers)) {
        if (!known.has(key)) found.add(key);
      }
    }

    return [...found];
  }, [survey.fields, responses]);

  const columns = useMemo(
    () => [
      ...survey.fields.map((field) => ({ key: field.id, label: field.label, orphan: false })),
      ...orphanKeys.map((key) => ({ key, label: 'Pergunta removida', orphan: true })),
    ],
    [survey.fields, orphanKeys]
  );

  // Resumo por opção para os campos de escolha — a leitura rápida do resultado.
  const summaries = useMemo(() => {
    const summarizable = survey.fields.filter((field) => SUMMARIZABLE_TYPES.includes(field.type));

    return summarizable.map((field) => {
      const options = field.type === 'yes_no' ? ['Sim', 'Não'] : field.options || [];
      const counts = new Map<string, number>(options.map((option) => [option, 0]));

      for (const response of responses) {
        const value = response.answers[field.id];
        const chosen = Array.isArray(value) ? value : value ? [String(value)] : [];

        for (const option of chosen) {
          counts.set(option, (counts.get(option) || 0) + 1);
        }
      }

      return { field, entries: [...counts.entries()] };
    });
  }, [survey.fields, responses]);

  const exportCsv = () => {
    const header = ['Data', ...columns.map((column) => column.label)];
    const rows = responses.map((response) => [
      response.created_at ? new Date(response.created_at).toLocaleString('pt-PT') : '',
      ...columns.map((column) => formatAnswer(response.answers[column.key] ?? null)),
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    // BOM para o Excel abrir os acentos corretamente.
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${survey.slug}-respostas.csv`;
    link.click();

    // O Firefox precisa que a URL continue viva até o download começar.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-white/70">Carregando respostas...</p>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white/80 font-medium">Nenhuma resposta ainda</p>
        <p className="text-white/55 text-sm mt-1">
          {survey.status === 'open'
            ? 'Envie o link da pesquisa para quem deve responder.'
            : 'Publique a pesquisa para começar a receber respostas.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/70 text-sm">
          <span className="text-2xl font-bold text-blue-300 align-middle mr-2">{responses.length}</span>
          resposta{responses.length === 1 ? '' : 's'} recebida{responses.length === 1 ? '' : 's'}
        </p>

        <button
          onClick={exportCsv}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {summaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map(({ field, entries }) => (
            <div key={field.id} className="card bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-medium text-white mb-4">{field.label}</h3>

              <div className="space-y-3">
                {entries.map(([option, count]) => {
                  const percent = Math.round((count / responses.length) * 100);

                  return (
                    <div key={option}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/80">{option}</span>
                        <span className="text-white/60 tabular-nums">
                          {count} · {percent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#567bc7] to-[#6f94df]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {orphanKeys.length > 0 && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100 text-sm">
          Há respostas gravadas para {orphanKeys.length} pergunta
          {orphanKeys.length === 1 ? '' : 's'} que não existe{orphanKeys.length === 1 ? '' : 'm'} mais
          na pesquisa. Elas aparecem como "Pergunta removida" na tabela e no CSV.
        </div>
      )}

      <div className="card bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">Data</th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left whitespace-nowrap ${
                      column.orphan ? 'text-amber-200/80 italic font-normal' : ''
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap tabular-nums">
                    {response.created_at ? new Date(response.created_at).toLocaleString('pt-PT') : '-'}
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-white/90 max-w-[280px] whitespace-pre-wrap break-words"
                    >
                      {formatAnswer(response.answers[column.key] ?? null) || (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDelete(response.id)}
                      className="min-h-[36px] px-3 py-2 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs transition-colors"
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSurveyDetailPage;
