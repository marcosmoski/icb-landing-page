import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';

interface MBWayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MBWayModal: React.FC<MBWayModalProps> = ({ isOpen, onClose }) => {
  const [valor, setValor] = useState('');
  const [telefoneUsuario, setTelefoneUsuario] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valor || !telefoneUsuario) {
      showToast({
        type: 'error',
        title: 'Dados incompletos',
        message: 'Preencha o valor e seu telefone.',
        duration: 4000
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Formatar telefone (remover espaços e caracteres especiais)
      const telefoneLimpo = telefoneUsuario.replace(/\D/g, '');

      // Validar telefone português
      if (!/^9[1236]\d{7}$/.test(telefoneLimpo)) {
        throw new Error('Telefone inválido. Use formato português (ex: 965169925)');
      }

      // 🚨 SIMULAÇÃO - Não envia nada real para o MB WAY
      // Para implementar de verdade, precisa:
      // 1. Conta business MB WAY
      // 2. API key e integração real
      // 3. Ver arquivo MBWAY_API_INTEGRATION.md

      showToast({
        type: 'info',
        title: 'Simulando solicitação...',
        message: '⚠️ Esta é apenas uma demonstração - nenhum pagamento real foi solicitado.',
        duration: 4000
      });

      // Simulação mais realista
      await new Promise(resolve => setTimeout(resolve, 3000));

      showToast({
        type: 'warning',
        title: 'Simulação concluída',
        message: `📱 Na vida real, você receberia uma notificação no MB WAY (${telefoneLimpo}) para confirmar ${valor}€.`,
        duration: 8000,
        action: {
          label: 'Ver integração real',
          onClick: () => {
            showToast({
              type: 'info',
              title: 'Integração Real MB WAY',
              message: 'Precisa conta business + API. Veja MBWAY_API_INTEGRATION.md',
              duration: 10000
            });
          }
        }
      });

      // Fechar modal
      onClose();

      // Limpar campos
      setValor('');
      setTelefoneUsuario('');

    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Erro no pagamento',
        message: error instanceof Error ? error.message : 'Não foi possível processar o pagamento.',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Aviso de simulação */}
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <div className="text-sm">
              <div className="font-medium text-yellow-200">Modo de Demonstração</div>
              <div className="text-yellow-300/80">Esta é apenas uma simulação - nenhum pagamento real será processado.</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <text x="12" y="8" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">MB</text>
                <text x="12" y="18" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">WAY</text>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Pagamento MB WAY</h3>
              <p className="text-sm text-white/70">Igreja ICB Gaia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Beneficiário */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-sm text-white/70 mb-1">Beneficiário</div>
          <div className="font-medium text-white">CONTA ECONOMIA SOCIAL</div>
          <div className="text-sm text-white/70 mt-1">IBAN: PT50003604079910602581786</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Seu Telefone MB WAY *
            </label>
            <input
              type="tel"
              value={telefoneUsuario}
              onChange={(e) => setTelefoneUsuario(e.target.value)}
              placeholder="Ex: 965169925"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Valor da Oferta (€) *
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Simulando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10,8 16,12 10,16 10,8"></polygon>
                </svg>
                Simular Solicitação
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">ℹ️</span>
            <div className="text-sm text-blue-100">
              <div className="font-medium mb-1">Como funcionaria na vida real:</div>
              <ol className="text-blue-200 space-y-1 text-xs">
                <li>1. Digite seu telefone e o valor</li>
                <li>2. Sistema envia solicitação para MB WAY</li>
                <li>3. Você recebe notificação push no app</li>
                <li>4. Abre o app e confirma o pagamento</li>
                <li>5. Pronto! Obrigado pela contribuição 💚</li>
              </ol>
              <div className="mt-2 text-blue-300/80 text-xs">
                <strong>Nota:</strong> Atualmente é apenas simulação. Para implementar de verdade, veja <code>MBWAY_API_INTEGRATION.md</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MBWayModal;
