import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import { z } from 'zod';
import 'react-phone-number-input/style.css';
import { useToast } from '@/hooks/useToast';
import { usePrayerRequest } from '@/store/features/prayerRequestsHooks';
import type { PrayerEmailPayload } from '@/lib/supabaseClient';

interface PrayerFormData {
  nome: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  batizado: boolean;
  pedidoOracao: string;
  visitaTipo: 'sim' | 'nao' | 'visitar_igreja';
}

const prayerRequestSchema = z
  .object({
    nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres.'),
    telefone: z.string().optional(),
    email: z.string().trim().optional(),
    dataNascimento: z.string().optional(),
    batizado: z.boolean(),
    pedidoOracao: z.string().trim().min(10, 'Pedido deve ter pelo menos 10 caracteres.'),
    visitaTipo: z.enum(['sim', 'nao', 'visitar_igreja']),
  })
  .superRefine((data, ctx) => {
    const phoneDigits = (data.telefone || '').replace(/\D/g, '');
    const hasValidPhone = phoneDigits.length >= 9;
    const hasValidEmail = !data.email ? false : z.email().safeParse(data.email.trim()).success;

    if (!hasValidPhone && !hasValidEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['telefone'],
        message: 'Informe pelo menos um contato válido: telefone ou e-mail.',
      });
    }
  });

const PrayerRequestsPage: React.FC = () => {
  const [formData, setFormData] = useState<PrayerFormData>({
    nome: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    batizado: false,
    pedidoOracao: '',
    visitaTipo: 'sim',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  const { showToast } = useToast();
  const { criarPedidoOracao, notificarPedidoPorEmail } = usePrayerRequest();

  React.useEffect(() => {
    const lastSubmitTime = localStorage.getItem('lastPrayerRequestSubmit');
    if (!lastSubmitTime) {
      return;
    }

    const timeSinceLastSubmit = Date.now() - Number.parseInt(lastSubmitTime, 10);
    const waitTime = 60000;

    if (timeSinceLastSubmit < waitTime) {
      setCanSubmit(false);
      setRemainingTime(Math.ceil((waitTime - timeSinceLastSubmit) / 1000));
    }
  }, []);

  React.useEffect(() => {
    if (canSubmit) {
      return;
    }

    if (remainingTime <= 0) {
      setCanSubmit(true);
      return;
    }

    const timeout = setTimeout(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [canSubmit, remainingTime]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isFormValid = useMemo(() => {
    return prayerRequestSchema.safeParse(formData).success;
  }, [formData.nome, formData.telefone, formData.email, formData.pedidoOracao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = prayerRequestSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Revise os dados informados.';
      showToast({
        type: 'warning',
        title: 'Dados incompletos',
        message: firstError,
        duration: 4500,
      });
      return;
    }

    if (!canSubmit) {
      showToast({
        type: 'warning',
        title: 'Aguarde um momento',
        message: `Por favor, aguarde ${remainingTime} segundos para enviar outro pedido.`,
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = validation.data;
      const telefone = sanitizedData.telefone?.trim() || '';
      const email = sanitizedData.email?.trim() || '';
      const dataNascimento = sanitizedData.dataNascimento?.trim() || '';

      const payload = {
        nome: sanitizedData.nome.trim(),
        batizado: sanitizedData.batizado,
        pedido_oracao: sanitizedData.pedidoOracao.trim(),
        visita_tipo: sanitizedData.visitaTipo,
        ...(telefone ? { telefone } : {}),
        ...(email ? { email } : {}),
        ...(dataNascimento ? { data_nascimento: dataNascimento } : {}),
      };

      const { error } = await criarPedidoOracao(payload);

      if (error) {
        showToast({
          type: 'error',
          title: 'Erro ao enviar pedido',
          message: 'Não foi possível registrar seu pedido de oração. Tente novamente.',
          duration: 5000,
        });
        return;
      }

      localStorage.setItem('lastPrayerRequestSubmit', Date.now().toString());
      setCanSubmit(false);
      setRemainingTime(60);

      const emailPayload: PrayerEmailPayload = {
        nome: payload.nome,
        batizado: payload.batizado,
        pedidoOracao: payload.pedido_oracao,
        visitaTipo: payload.visita_tipo,
        enviadoEm: new Date().toISOString(),
        ...(telefone ? { telefone } : {}),
        ...(email ? { email } : {}),
        ...(dataNascimento ? { dataNascimento } : {}),
      };

      const notifyResult = await notificarPedidoPorEmail(emailPayload);
      if (notifyResult.error) {
        console.warn('Pedido salvo, mas notificação por e-mail falhou:', notifyResult.error.message);
      }

      showToast({
        type: 'success',
        title: 'Pedido enviado com sucesso',
        message: 'Nossa equipe vai orar por você e entrará em contato se necessário.',
        duration: 6000,
      });

      setFormData({
        nome: '',
        telefone: '',
        email: '',
        dataNascimento: '',
        batizado: false,
        pedidoOracao: '',
        visitaTipo: 'sim',
      });
    } catch (submitError) {
      console.error('Erro inesperado ao enviar pedido:', submitError);
      showToast({
        type: 'error',
        title: 'Erro inesperado',
        message: 'Tivemos um problema ao enviar. Tente novamente em instantes.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a19] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,89,170,0.45),transparent_45%),radial-gradient(circle_at_75%_30%,rgba(164,189,255,0.2),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(22,33,76,0.6),transparent_55%)]" />

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-[28px] border border-slate-400/20 bg-[linear-gradient(145deg,rgba(14,21,44,0.95),rgba(6,10,25,0.94))] shadow-[0_24px_60px_rgba(2,6,23,0.7)] p-5 sm:p-8">
          <header className="mb-8">
            <div className="flex justify-end mb-4">
              <Link
                to="/"
                className="shrink-0 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm"
              >
                Voltar
              </Link>
            </div>

            <div className="text-center">
              <Link to="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity mb-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                  <img src="/icblogo.png" alt="ICB Gaia" className="w-11 h-11 object-contain" />
                </span>
              </Link>

              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">Pedidos de oração</h1>
              <p className="text-slate-300/85 mt-2 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                Estamos com você em oração. Escreva seu pedido e, se desejar, nossa equipe pode entrar em contato com cuidado e discrição.
              </p>
            </div>
          </header>

          <section className="mb-6 rounded-2xl border border-amber-300/45 bg-amber-400/10 p-4 sm:p-5">
            <h2 className="text-amber-200 font-semibold text-base sm:text-lg uppercase tracking-wide">Importante sobre seus dados</h2>
            <p className="text-amber-100/95 mt-2 leading-relaxed">
              Usaremos seus dados exclusivamente para orar por você e, se necessário, fazer contato pastoral relacionado ao seu pedido.
              Não vendemos, não compartilhamos e não usamos suas informações para qualquer outro fim.
            </p>
            <p className="text-amber-100/95 mt-2 leading-relaxed">
              Precisamos do seu nome para saber por quem orar e de um contato (e-mail ou telefone) para responder caso você precise de visita ou acompanhamento.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-slate-100 mb-2">
                Nome completo *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-400/30 bg-slate-900/40 text-white placeholder:text-slate-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Digite o seu nome"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-slate-100 mb-2">
                  WhatsApp para contato
                </label>
                <PhoneInput
                  id="telefone"
                  name="telefone"
                  international
                  defaultCountry="PT"
                  countryCallingCodeEditable={false}
                  value={formData.telefone || undefined}
                  onChange={(value) => {
                    const normalizedPhone = value || '';
                    setFormData((prev) => ({ ...prev, telefone: normalizedPhone }));
                  }}
                  placeholder="Opcional: +351 ..."
                  className="phone-input-custom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-100 mb-2">
                  E-mail para contato
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-400/30 bg-slate-900/40 text-white placeholder:text-slate-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Opcional: seunome@email.com"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/80 -mt-1">
              Preencha pelo menos um contato: e-mail ou telefone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-slate-100 mb-2">
                  Data de nascimento
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-400/30 bg-slate-900/40 text-white placeholder:text-slate-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-400/20 bg-slate-900/35 px-4 py-4">
              <input
                id="batizado"
                name="batizado"
                type="checkbox"
                checked={formData.batizado}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-400/50 bg-transparent"
              />
              <label htmlFor="batizado" className="text-slate-100 cursor-pointer">
                Já sou batizado nas águas
              </label>
            </div>

            <div>
              <label htmlFor="pedidoOracao" className="block text-sm font-medium text-slate-100 mb-2">
                Como podemos orar por você? *
              </label>
              <textarea
                id="pedidoOracao"
                name="pedidoOracao"
                rows={4}
                value={formData.pedidoOracao}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-400/30 bg-slate-900/40 text-white placeholder:text-slate-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                placeholder="Escreva aqui seu pedido de oração"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-100 mb-3">
                Você gostaria de receber uma visita para oração? *
              </legend>
              <div className="space-y-2 text-slate-100">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="visitaTipo"
                    value="sim"
                    checked={formData.visitaTipo === 'sim'}
                    onChange={handleInputChange}
                  />
                  Sim
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="visitaTipo"
                    value="nao"
                    checked={formData.visitaTipo === 'nao'}
                    onChange={handleInputChange}
                  />
                  Não
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="visitaTipo"
                    value="visitar_igreja"
                    checked={formData.visitaTipo === 'visitar_igreja'}
                    onChange={handleInputChange}
                  />
                  Gostaria de visitar a igreja
                </label>
              </div>
            </fieldset>

            <div className="pt-1">
              <button
                type="submit"
                disabled={!isFormValid || !canSubmit || isSubmitting}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#567bc7] to-[#6f94df] text-white font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Enviando pedido...' : !canSubmit ? `Aguarde ${remainingTime}s` : 'Enviar pedido'}
              </button>

              {!canSubmit && remainingTime > 0 && (
                <p className="text-center text-amber-300 text-sm mt-2">
                  Para evitar spam, aguarde {remainingTime} segundos antes de enviar outro pedido.
                </p>
              )}
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <a
              href="https://wa.me/351965169925"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15"
            >
              Falar pelo WhatsApp
            </a>

            <p className="text-slate-300/75 text-sm text-center">
              As informações enviadas serão tratadas com cuidado e discrição.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrayerRequestsPage;
