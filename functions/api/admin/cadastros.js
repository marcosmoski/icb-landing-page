// Painel de administração para visualizar cadastros
// Rota: /api/admin/cadastros

export async function onRequestGet(context) {
  const { request, env } = context;

  // Autenticação básica (implemente uma mais robusta em produção)
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.substring(7);
  // Verifique o token (use um JWT ou chave fixa)
  const validToken = env.ADMIN_TOKEN || 'admin-token-temporario';
  if (token !== validToken) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Buscar cadastros com paginação
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;

    const status = url.searchParams.get('status'); // pendente, contatado, confirmado, cancelado

    let query = `
      SELECT id, nome, email, telefone, data_nascimento, status,
             created_at, contato_realizado_em, observacoes
      FROM cadastros
    `;
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const cadastros = await env.DB.prepare(query).bind(...params).all();

    // Contar total
    const totalQuery = status
      ? 'SELECT COUNT(*) as total FROM cadastros WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM cadastros';

    const totalResult = await env.DB.prepare(totalQuery)
      .bind(...(status ? [status] : []))
      .first();

    const totalPages = Math.ceil(totalResult.total / limit);

    return new Response(JSON.stringify({
      cadastros: cadastros.results,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao buscar cadastros:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Atualizar status de cadastro
export async function onRequestPut(context) {
  const { request, env } = context;

  // Autenticação
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const cadastroId = url.pathname.split('/').pop();

    if (!cadastroId || isNaN(cadastroId)) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData = await request.json();
    const { status, observacoes } = updateData;

    // Validar status
    const validStatuses = ['pendente', 'contatado', 'confirmado', 'cancelado'];
    if (status && !validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Status inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Atualizar cadastro
    const updateFields = [];
    const params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }

    if (observacoes !== undefined) {
      updateFields.push('observacoes = ?');
      params.push(observacoes);
    }

    if (status === 'contatado') {
      updateFields.push('contato_realizado_em = CURRENT_TIMESTAMP');
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    params.push(cadastroId);

    const updateQuery = `
      UPDATE cadastros
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await env.DB.prepare(updateQuery).bind(...params).run();

    // Registrar log
    await env.DB.prepare(`
      INSERT INTO cadastro_logs (cadastro_id, acao, detalhes)
      VALUES (?, 'atualizado', ?)
    `).bind(cadastroId, `Status alterado para: ${status}`).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Cadastro atualizado com sucesso'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao atualizar cadastro:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
