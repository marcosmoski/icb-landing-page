import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminCadastros, useCadastroStats, useCadastro } from '../store/features/cadastroHooks';
import type { MembroIgreja } from '../lib/supabaseClient';

// Componente de exemplo para painel administrativo
const AdminPanel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMembro, setSelectedMembro] = useState<MembroIgreja | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hooks customizados
  const { cadastros, pagination, isLoading, error } = useAdminCadastros(currentPage, 20, selectedStatus);
  const { stats, isLoading: statsLoading } = useCadastroStats();
  const { atualizarCadastro, isUpdating } = useCadastro();

  const handleStatusChange = async (cadastroId: number, newStatus: MembroIgreja['status']) => {
    try {
      const { error } = await atualizarCadastro(cadastroId, { status: newStatus });
      if (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Tente novamente.');
      } else {
        // Recarregar página atual para atualizar dados (a lista deve atualizar via hook se estiver usando realtime ou refetch)
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const openModal = (membro: MembroIgreja) => {
    setSelectedMembro(membro);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMembro(null);
    setIsModalOpen(false);
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
                  <th className="px-4 py-3 text-left">Batizado?</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Nascimento</th>
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
                      {cadastro.batizado ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={cadastro.status}
                        onChange={(e) => handleStatusChange(cadastro.id!, e.target.value as MembroIgreja['status'])}
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
                    <td className="px-4 py-3 text-sm text-white/70">
                      {cadastro.data_nascimento ? new Date(cadastro.data_nascimento).toLocaleDateString('pt-PT') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(cadastro)}
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
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </main>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {isModalOpen && selectedMembro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Detalhes do Cadastro</h2>
              <button
                onClick={closeModal}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Nome Completo</h3>
                  <p className="text-white text-lg">{selectedMembro.nome}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    selectedMembro.status === 'confirmado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    selectedMembro.status === 'cancelado' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    selectedMembro.status === 'contatado' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {selectedMembro.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Email</h3>
                  <a href={`mailto:${selectedMembro.email}`} className="text-blue-400 hover:underline">
                    {selectedMembro.email}
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Telefone</h3>
                  <a href={`tel:${selectedMembro.telefone}`} className="text-blue-400 hover:underline">
                    {selectedMembro.telefone}
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Data de Nascimento</h3>
                  <p className="text-white">
                    {selectedMembro.data_nascimento 
                      ? new Date(selectedMembro.data_nascimento).toLocaleDateString('pt-PT') 
                      : 'Não informada'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Batizado nas Águas?</h3>
                  <p className="text-white">
                    {selectedMembro.batizado ? 'Sim ✅' : 'Não ❌'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">Data do Cadastro</h3>
                  <p className="text-white">
                    {selectedMembro.created_at 
                      ? new Date(selectedMembro.created_at).toLocaleString('pt-PT') 
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/50 mb-2">Mensagem</h3>
                <div className="bg-white/5 rounded-xl p-4 text-white/80 whitespace-pre-wrap border border-white/10">
                  {selectedMembro.mensagem || 'Nenhuma mensagem enviada.'}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
              >
                Fechar
              </button>
              <a
                href={`https://wa.me/${selectedMembro.telefone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
