import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminCadastros, useCadastroStats, useCadastro } from '../store/features/cadastroHooks';
import type { Cadastro } from '../store/features/types';

// Componente de exemplo para painel administrativo
const AdminPanel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Hooks customizados
  const { cadastros, pagination, isLoading, error } = useAdminCadastros(currentPage, 20, selectedStatus);
  const { stats, isLoading: statsLoading } = useCadastroStats();
  const { atualizarCadastro, isUpdating } = useCadastro();

  const handleStatusChange = async (cadastroId: number, newStatus: Cadastro['status']) => {
    try {
      await atualizarCadastro({ id: cadastroId, status: newStatus }).unwrap();
      // RTK Query automaticamente invalida o cache e refetch
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando cadastros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Erro ao carregar cadastros</div>
          <p className="text-white/70">{error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <img
                src="./icblogo.png"
                alt="Logo Igreja"
                className="w-12 h-12 rounded-xl ring-2 ring-white/20"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">ICB Gaia - Admin</h1>
                <p className="text-white/70 text-sm">Painel de Controle</p>
              </div>
            </Link>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Voltar ao Site
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <main className="max-w-6xl mx-auto px-6 pb-8">
        {!statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-white/70">Total</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pendentes}</div>
              <div className="text-sm text-white/70">Pendentes</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.contatados}</div>
              <div className="text-sm text-white/70">Contatados</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.confirmados}</div>
              <div className="text-sm text-white/70">Confirmados</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.cancelados}</div>
              <div className="text-sm text-white/70">Cancelados</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="contatado">Contatado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Cadastros Table */}
        <div className="card bg-white/5 backdrop-blur rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Telefone</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cadastros.map((cadastro) => (
                  <tr key={cadastro.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{cadastro.nome}</td>
                    <td className="px-4 py-3">{cadastro.email}</td>
                    <td className="px-4 py-3">{cadastro.telefone}</td>
                    <td className="px-4 py-3">
                      <select
                        value={cadastro.status}
                        onChange={(e) => handleStatusChange(cadastro.id, e.target.value as Cadastro['status'])}
                        disabled={isUpdating}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="contatado">Contatado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {new Date(cadastro.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {/* Mostrar detalhes */}}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
