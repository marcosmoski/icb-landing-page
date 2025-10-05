// Cloudflare Pages Functions - API profissional para cadastros
// Usa Cloudflare D1 (banco de dados gratuito e escalável)

import { validateEmail, validatePhone, sanitizeInput } from '../utils/validation.js';

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request, env } = context;

    // Rate limiting básico (pode ser expandido)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate_limit_${clientIP}`;
    const lastRequest = await env.CADASTROS_KV?.get(rateLimitKey);

    if (lastRequest) {
      const timeDiff = Date.now() - parseInt(lastRequest);
      if (timeDiff < 30000) { // 30 segundos entre cadastros
        return new Response(JSON.stringify({
          error: 'Aguarde alguns segundos antes de enviar outro cadastro.',
          retryAfter: Math.ceil((30000 - timeDiff) / 1000)
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': '30' }
        });
      }
    }

    // Parse e validação do JSON
    let formData;
    try {
      formData = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Dados inválidos. Envie um JSON válido.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validação e sanitização dos dados
    const errors = [];

    if (!formData.nome?.trim()) {
      errors.push('Nome é obrigatório');
    } else if (formData.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!formData.email?.trim()) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(formData.email)) {
      errors.push('Email inválido');
    }

    if (!formData.telefone?.trim()) {
      errors.push('Telefone é obrigatório');
    } else if (!validatePhone(formData.telefone)) {
      errors.push('Telefone inválido');
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({
        error: 'Dados inválidos',
        details: errors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Sanitizar dados
    const sanitizedData = {
      nome: sanitizeInput(formData.nome.trim()),
      email: formData.email.trim().toLowerCase(),
      telefone: sanitizeInput(formData.telefone.trim()),
      data_nascimento: formData.dataNascimento ? new Date(formData.dataNascimento).toISOString().split('T')[0] : null,
      mensagem: formData.mensagem ? sanitizeInput(formData.mensagem.trim()) : null,
      fonte: 'website',
      ip_address: clientIP,
      user_agent: request.headers.get('User-Agent') || null
    };

    // Verificar se email já existe
    const existingUser = await env.DB.prepare(
      'SELECT id FROM cadastros WHERE email = ?'
    ).bind(sanitizedData.email).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'Este email já está cadastrado.',
        message: 'Se você já se cadastrou, entraremos em contato em breve.'
      }), {
        status: 409,
        headers: corsHeaders
      });
    }

    // Inserir no banco de dados D1
    const insertResult = await env.DB.prepare(`
      INSERT INTO cadastros (
        nome, email, telefone, data_nascimento, mensagem,
        fonte, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sanitizedData.nome,
      sanitizedData.email,
      sanitizedData.telefone,
      sanitizedData.data_nascimento,
      sanitizedData.mensagem,
      sanitizedData.fonte,
      sanitizedData.ip_address,
      sanitizedData.user_agent
    ).run();

    const cadastroId = insertResult.meta.last_row_id;

    // Registrar log de auditoria
    await env.DB.prepare(`
      INSERT INTO cadastro_logs (cadastro_id, acao, detalhes)
      VALUES (?, 'criado', 'Cadastro realizado via website')
    `).bind(cadastroId).run();

    // Rate limiting - salvar timestamp da requisição
    await env.CADASTROS_KV?.put(rateLimitKey, Date.now().toString(), { expirationTtl: 300 }); // 5 minutos

    // Enviar notificação por email (usando Cloudflare Email Routing - gratuito)
    try {
      await sendNotificationEmail(env, sanitizedData, cadastroId);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Não falhar a requisição por erro de email
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Cadastro realizado com sucesso! Entraremos em contato em breve.',
      cadastroId: cadastroId
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Erro interno:', error);

    return new Response(JSON.stringify({
      error: 'Erro interno do servidor. Tente novamente mais tarde.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Função para enviar notificação por email
async function sendNotificationEmail(env, cadastroData, cadastroId) {
  const emailDestino = await env.DB.prepare(
    'SELECT valor FROM configuracoes WHERE chave = ?'
  ).bind('notificacao_email').first();

  if (!emailDestino?.valor) {
    console.log('Email de notificação não configurado');
    return;
  }

  // Usando Cloudflare Email Routing (gratuito)
  // Você precisa configurar o domínio no painel do Cloudflare
  const emailData = {
    to: emailDestino.valor,
    from: 'cadastros@icb-gaia.pages.dev', // Configure seu domínio
    subject: `Novo cadastro - Igreja ICB Gaia #${cadastroId}`,
    html: `
      <h2>Novo cadastro realizado!</h2>
      <p><strong>ID:</strong> ${cadastroId}</p>
      <p><strong>Nome:</strong> ${cadastroData.nome}</p>
      <p><strong>Email:</strong> ${cadastroData.email}</p>
      <p><strong>Telefone:</strong> ${cadastroData.telefone}</p>
      ${cadastroData.data_nascimento ? `<p><strong>Data de nascimento:</strong> ${cadastroData.data_nascimento}</p>` : ''}
      ${cadastroData.mensagem ? `<p><strong>Mensagem:</strong> ${cadastroData.mensagem}</p>` : ''}
      <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-PT')}</p>
      <hr>
      <p><a href="https://icb-gaia.pages.dev/admin/cadastros">Ver todos os cadastros</a></p>
    `
  };

  // Para usar Email Routing, você precisa configurar no painel do Cloudflare
  // Por enquanto, vamos usar um webhook ou serviço alternativo
  console.log('Notificação de email:', emailData);

  // Alternativa: usar webhook para Zapier/Make.com/etc
  if (env.EMAIL_WEBHOOK_URL) {
    await fetch(env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
  }
}
