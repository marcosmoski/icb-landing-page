// @ts-nocheck
import { Resend } from 'npm:resend@4.0.0';

interface PrayerEmailPayload {
  nome: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
  batizado: boolean;
  pedidoOracao: string;
  visitaTipo: 'sim' | 'nao' | 'visitar_igreja';
  enviadoEm: string;
}

// icbgaia.geral@gmail.com 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatVisitType = (value: PrayerEmailPayload['visitaTipo']) => {
  if (value === 'sim') return 'Sim';
  if (value === 'nao') return 'Não';
  return 'Gostaria de visitar a igreja';
};

const formatOptionalField = (value?: string) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue || normalizedValue.toLowerCase() === 'undefined' || normalizedValue.toLowerCase() === 'null') {
    return 'Não informado';
  }

  return normalizedValue;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const churchEmail = Deno.env.get('CHURCH_NOTIFICATION_EMAIL');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'ICB Gaia <jesusteama@icbgaia.pt>';

    if (!resendApiKey || !churchEmail) {
      return new Response(
        JSON.stringify({ error: 'Configuração de email ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = (await req.json()) as PrayerEmailPayload;
  const telefone = formatOptionalField(payload.telefone);
  const email = formatOptionalField(payload.email);

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: fromEmail,
      to: [churchEmail],
      subject: `Novo pedido de oração - ${payload.nome}`,
      html: `
        <h2>Novo pedido de oração recebido</h2>
        <p><strong>Nome:</strong> ${payload.nome}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Data de Nascimento:</strong> ${payload.dataNascimento || 'Não informada'}</p>
        <p><strong>Batizado:</strong> ${payload.batizado ? 'Sim' : 'Não'}</p>
        <p><strong>Preferência de visita:</strong> ${formatVisitType(payload.visitaTipo)}</p>
        <p><strong>Enviado em:</strong> ${new Date(payload.enviadoEm).toLocaleString('pt-PT')}</p>
        <hr />
        <p><strong>Pedido:</strong></p>
        <p>${payload.pedidoOracao.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
