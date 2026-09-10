import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { useToast } from '@/hooks/useToast';
import { statusLabel, statusStyle } from '@/lib/surveyUi';
import { createSurveySlug, useAdminSurveys, useSurveyMutations } from '@/store/features/surveysHooks';

const AdminSurveysPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const { surveys, isLoading, error } = useAdminSurveys(refreshKey);
  const { createSurvey, deleteSurvey, isSaving } = useSurveyMutations();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = newTitle.trim();
    if (title.length < 3) {
      setTitleError('Dê um nome com pelo menos 3 caracteres.');
      return;
    }

    setTitleError('');

    const { data, error: createError } = await createSurvey({
      title,
      description: newDescription.trim() || undefined,
      slug: createSurveySlug(title),
    });

    if (createError || !data) {
      showToast({
        type: 'error',
        title: 'Erro ao criar pesquisa',
        message: createError?.message || 'Tente novamente.',
        duration: 5000,
      });
      return;
    }

    navigate(`/admin/pesquisas/${data.id}`);
  };

  const handleDelete = async (id: string, title: string, responseCount: number) => {
    const warning = responseCount
      ? `Apagar "${title}"? As ${responseCount} respostas também serão apagadas. Esta ação não pode ser desfeita.`
      : `Apagar "${title}"? Esta ação não pode ser desfeita.`;

    if (!window.confirm(warning)) return;

    const { error: deleteError } = await deleteSurvey(id);

    if (deleteError) {
      showToast({
        type: 'error',
        title: 'Erro ao apagar',
        message: deleteError.message,
        duration: 5000,
      });
      return;
    }

    showToast({ type: 'success', title: 'Pesquisa apagada', duration: 3000 });
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader subtitle="Pesquisas" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold">Pesquisas da igreja</h2>
            <p className="text-white/60 text-sm">
              Monte o formulário, envie o link para quem deve responder e acompanhe as respostas.
            </p>
          </div>

          <button
            onClick={() => setIsCreating((prev) => !prev)}
            className={`min-h-[40px] px-4 py-2 rounded-xl font-medium transition ${
              isCreating
                ? 'bg-white/10 hover:bg-white/20 border border-white/15'
                : 'bg-gradient-to-r from-[#567bc7] to-[#6f94df] hover:brightness-110'
            }`}
          >
            {isCreating ? 'Cancelar' : '+ Nova pesquisa'}
          </button>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="card bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4"
          >
            <div>
              <label htmlFor="novo-titulo" className="block text-sm font-medium text-white/80 mb-2">
                Nome da pesquisa *
              </label>
              <input
                id="novo-titulo"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                autoFocus
                aria-invalid={titleError ? true : undefined}
                aria-describedby={titleError ? 'erro-novo-titulo' : undefined}
                placeholder="Ex.: Áreas para servir"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                  titleError ? 'border-red-400/50' : 'border-white/20'
                }`}
              />
              {titleError && (
                <p id="erro-novo-titulo" className="text-red-300 text-sm mt-2">
                  {titleError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="nova-descricao" className="block text-sm font-medium text-white/80 mb-2">
                Descrição (aparece no topo do formulário)
              </label>
              <textarea
                id="nova-descricao"
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explique em uma frase para que serve a pesquisa"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[40px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#567bc7] to-[#6f94df] hover:brightness-110 disabled:opacity-60 font-medium transition"
            >
              {isSaving ? 'Criando...' : 'Criar e configurar perguntas'}
            </button>
          </form>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-white/70">Carregando pesquisas...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            Erro ao carregar pesquisas: {error}
          </div>
        )}

        {!isLoading && !error && surveys.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white/80 font-medium">Nenhuma pesquisa ainda</p>
            <p className="text-white/55 text-sm mt-1">
              Crie a primeira em "Nova pesquisa" — leva menos de um minuto.
            </p>
          </div>
        )}

        {!isLoading && surveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="card bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{survey.title}</h3>
                    <p className="text-white/55 text-sm mt-1">
                      {survey.fields.length} pergunta{survey.fields.length === 1 ? '' : 's'} ·{' '}
                      {survey.responseCount} resposta{survey.responseCount === 1 ? '' : 's'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${statusStyle[survey.status]}`}
                  >
                    {statusLabel[survey.status]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-auto">
                  <Link
                    to={`/admin/pesquisas/${survey.id}`}
                    className="min-h-[40px] inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Abrir
                  </Link>

                  {survey.status === 'open' && (
                    <a
                      href={`/pesquisa/${survey.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] inline-flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                    >
                      Ver formulário
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(survey.id, survey.title, survey.responseCount)}
                    className="ml-auto min-h-[40px] px-3 py-2 rounded-lg text-sm text-white/50 hover:text-red-300 hover:bg-red-600/15 transition-colors"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSurveysPage;
