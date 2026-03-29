import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { PedidoOracao, PedidoOracaoStatus, PedidoOracaoVisita } from '@/lib/supabaseClient';
import {
  useAdminPrayerRequests,
  usePrayerRequest,
  usePrayerRequestStats,
} from '@/store/features/prayerRequestsHooks';

const statusStyles: Record<PedidoOracaoStatus, string> = {
  novo: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  em_atendimento: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  atendido: 'bg-green-500/20 text-green-300 border-green-500/30',
  encerrado: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const visitaLabel: Record<PedidoOracaoVisita, string> = {
  sim: 'Sim',
  nao: 'Não',
  visitar_igreja: 'Gostaria de visitar a igreja',
};

const AdminPrayerRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<PedidoOracaoStatus | ''>('');
  const [selectedVisitType, setSelectedVisitType] = useState<PedidoOracaoVisita | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedPedido, setSelectedPedido] = useState<PedidoOracao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { pedidos, pagination, isLoading, error } = useAdminPrayerRequests(
    currentPage,
    20,
    {
      status: selectedStatus,
      visita_tipo: selectedVisitType,
      query: searchTerm,
    },
    refreshKey
  );

  const { stats, isLoading: statsLoading } = usePrayerRequestStats();
  const { atualizarPedidoOracao, isUpdating } = usePrayerRequest();

  const openModal = (pedido: PedidoOracao) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPedido(null);
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleStatusChange = async (pedidoId: number, newStatus: PedidoOracaoStatus) => {
    const { error: updateError } = await atualizarPedidoOracao(pedidoId, { status: newStatus });

    if (updateError) {
      alert('Erro ao atualizar status do pedido.');
      return;
    }

    setRefreshKey((prev) => prev + 1);
  };

  const onStatusFilterChange = (value: string) => {
    setCurrentPage(1);
    setSelectedStatus((value as PedidoOracaoStatus) || '');
  };

  const onVisitFilterChange = (value: string) => {
    setCurrentPage(1);
    setSelectedVisitType((value as PedidoOracaoVisita) || '');
  };

  const onSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p>Carregando pedidos de oração...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Erro ao carregar pedidos</div>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-4">
            <img src="/icblogo.png" alt="Logo Igreja" className="w-12 h-12 rounded-xl ring-2 ring-white/20" />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">ICB Gaia - Admin</h1>
              <p className="text-white/70 text-sm">Pedidos de oração</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Cadastros
            </Link>
            <Link
              to="/admin/pedidos-oracao"
              className="px-3 py-2 bg-blue-600/30 border border-blue-500/40 rounded-lg text-sm font-medium"
            >
              Pedidos de oração
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-8">
        {!statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.total}</div>
              <div className="text-sm text-white/70">Total</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.novo}</div>
              <div className="text-sm text-white/70">Novos</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{stats.em_atendimento}</div>
              <div className="text-sm text-white/70">Em atendimento</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{stats.atendido}</div>
              <div className="text-sm text-white/70">Atendidos</div>
            </div>
            <div className="card bg-white/5 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-300">{stats.encerrado}</div>
              <div className="text-sm text-white/70">Encerrados</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail"
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white md:col-span-2"
          />

          <select
            value={selectedStatus}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
          >
            <option value="">Todos os status</option>
            <option value="novo">Novo</option>
            <option value="em_atendimento">Em atendimento</option>
            <option value="atendido">Atendido</option>
            <option value="encerrado">Encerrado</option>
          </select>

          <select
            value={selectedVisitType}
            onChange={(e) => onVisitFilterChange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
          >
            <option value="">Todas as preferências</option>
            <option value="sim">Quer visita</option>
            <option value="nao">Não quer visita</option>
            <option value="visitar_igreja">Quer visitar igreja</option>
          </select>
        </div>

        <div className="card bg-white/5 backdrop-blur rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Contato</th>
                  <th className="px-4 py-3 text-left">Visita</th>
                  <th className="px-4 py-3 text-left">Batizado</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{pedido.nome}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-white/90">{pedido.telefone || '-'}</div>
                        <div className="text-white/70">{pedido.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">{visitaLabel[pedido.visita_tipo]}</td>
                    <td className="px-4 py-3">{pedido.batizado ? 'Sim' : 'Não'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={pedido.status}
                        onChange={(e) => handleStatusChange(pedido.id, e.target.value as PedidoOracaoStatus)}
                        disabled={isUpdating}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        <option value="novo">Novo</option>
                        <option value="em_atendimento">Em atendimento</option>
                        <option value="atendido">Atendido</option>
                        <option value="encerrado">Encerrado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {pedido.created_at ? new Date(pedido.created_at).toLocaleString('pt-PT') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(pedido)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        Ver detalhe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2">
              Página {pagination.page} de {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </main>

      {isModalOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Detalhe do pedido de oração</h2>
              <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors">
                Fechar
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Nome</h3>
                  <p className="text-white">{selectedPedido.nome}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Telefone</h3>
                  {selectedPedido.telefone ? (
                    <a href={`tel:${selectedPedido.telefone}`} className="text-blue-300 hover:underline">
                      {selectedPedido.telefone}
                    </a>
                  ) : (
                    <p className="text-white/70">Não informado</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">E-mail</h3>
                  {selectedPedido.email ? (
                    <a href={`mailto:${selectedPedido.email}`} className="text-blue-300 hover:underline">
                      {selectedPedido.email}
                    </a>
                  ) : (
                    <p className="text-white/70">Não informado</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Data de nascimento</h3>
                  <p className="text-white">
                    {selectedPedido.data_nascimento
                      ? new Date(selectedPedido.data_nascimento).toLocaleDateString('pt-PT')
                      : 'Não informada'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Batizado</h3>
                  <p className="text-white">{selectedPedido.batizado ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Preferência de visita</h3>
                  <p className="text-white">{visitaLabel[selectedPedido.visita_tipo]}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${statusStyles[selectedPedido.status]}`}>
                    {selectedPedido.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/50 mb-2">Pedido de oração</h3>
                <div className="bg-white/5 rounded-xl p-4 text-white/85 whitespace-pre-wrap border border-white/10">
                  {selectedPedido.pedido_oracao}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrayerRequestsPage;
