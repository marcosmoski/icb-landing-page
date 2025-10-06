import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import MBWayModal from './MBWayModal';

interface BibleVerse {
  text: string;
  reference: string;
}

const VerseSection: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMBWayModalOpen, setIsMBWayModalOpen] = useState(false);

  // Hook de notificações
  const { showToast } = useToast();

  // Versículos locais como fallback
  const fallbackVerses = useMemo(() => [
    '"O Senhor é o meu pastor; nada me faltará." — Salmo 23:1',
    '"Buscai primeiro o Reino de Deus..." — Mateus 6:33',
    '"Tudo posso naquele que me fortalece." — Filipenses 4:13',
    '"Lâmpada para os meus pés é a tua palavra..." — Salmo 119:105',
    '"Entrega o teu caminho ao Senhor; confia nele..." — Salmo 37:5',
  ], []);

  // Referências bíblicas populares para buscar
  const popularReferences = useMemo(() => [
    'john+3:16',
    'psalms+23:1',
    'matthew+6:33',
    'philippians+4:13',
    'psalms+119:105',
    'psalms+37:5',
    'jeremiah+29:11',
    'romans+8:28',
    'isaiah+40:31',
    'proverbs+3:5-6',
    'matthew+11:28',
    'john+14:6',
    'romans+12:2',
    'ephesians+2:8-9',
    'galatians+5:22-23'
  ], []);

  const fetchRandomVerse = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Escolher uma referência aleatória
      const randomRef = popularReferences[Math.floor(Math.random() * popularReferences.length)];
      
      // Buscar versículo da API
      const response = await fetch(`https://bible-api.com/${randomRef}?translation=almeida`);
      
      if (response.ok) {
        const data = await response.json();
        const verse: BibleVerse = {
          text: data.text,
          reference: data.reference
        };
        
        setCurrentVerse(`"${verse.text.trim()}" — ${verse.reference}`);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Fallback para versículos locais se a API falhar
      const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
      setCurrentVerse(fallbackVerses[randomIndex]);
    } finally {
      setIsLoading(false);
    }
  }, [fallbackVerses, popularReferences]);

  const getRandomVerse = useCallback(() => {
    fetchRandomVerse();
  }, [fetchRandomVerse]);

  useEffect(() => {
    getRandomVerse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = async (text: string, buttonElement: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Copiado!';
      setTimeout(() => {
        buttonElement.textContent = originalText;
      }, 1500);
    } catch {
      alert('Não foi possível copiar');
    }
  };

  const shareData = async () => {
    const text = `Dízimos e Ofertas — Igreja ICB Gaia\nBeneficiário: RESGATAR INDICES - ASSOCIAÇÃO\nIBAN: PT50003604079910602581786`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Dízimos e Ofertas — Igreja ICB Gaia', text });
      } catch {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Dados copiados para partilha.');
      } catch {
        alert('Não foi possível copiar os dados');
      }
    }
  };

  const openMBWay = async (phoneNumber: string) => {
    // Copia o número para a área de transferência primeiro
    try {
      await navigator.clipboard.writeText(phoneNumber);
    } catch {
      // Fallback se clipboard não funcionar
      console.log(`Número copiado: ${phoneNumber}`);
    }

    // Detecta o sistema operacional e navegador
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
    const isMobile = isIOS || isAndroid;

    console.log('Ambiente MB WAY detectado:', {
      isIOS, isAndroid, isChrome, isFirefox, isSafari, userAgent: navigator.userAgent
    });

    // Múltiplas estratégias para abrir deep links (problemas comuns)
    const attemptOpenApp = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 2500);

        try {
          if (isIOS) {
            // iOS: diferentes abordagens por navegador
            if (isSafari) {
              // Safari iOS: mais confiável
              window.location.href = url;
            } else {
              // Chrome/Firefox iOS: tenta location.replace
              window.location.replace(url);
            }
          } else if (isAndroid) {
            // Android: estratégias específicas por navegador
            if (isChrome) {
              // Chrome Android: usa window.location.href
              window.location.href = url;
            } else if (isFirefox) {
              // Firefox Android: usa iframe oculto (mais confiável)
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.style.width = '1px';
              iframe.style.height = '1px';
              iframe.src = url;
              document.body.appendChild(iframe);

              // Remove iframe após tentativa
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 2000);
            } else {
              // Outros navegadores Android
              try {
                window.open(url, '_system');
              } catch {
                window.location.href = url;
              }
            }
          } else {
            // Desktop
            window.open(url, '_blank');
          }

          // Detecta se o app abriu (página ficou em background)
          const checkIfAppOpened = () => {
            if (document.hidden || document.visibilityState === 'hidden') {
              clearTimeout(timeout);
              resolve(true);
            }
          };

          document.addEventListener('visibilitychange', checkIfAppOpened, { once: true });

        } catch (error) {
          console.log('Erro ao tentar abrir MB WAY:', error);
          clearTimeout(timeout);
          resolve(false);
        }
      });
    };

    // URLs alternativas para tentar (deep links têm problemas de compatibilidade)
    const urlsToTry = [
      // URL oficial do MB WAY
      `mbway://pay?phone=${phoneNumber}`,

      // Intent Android (mais específico)
      `intent://pay?phone=${phoneNumber}#Intent;scheme=mbway;package=pt.sibs.mbway;S.browser_fallback_url=https%3A%2F%2Fwww.mbway.pt;end`,

      // Apenas abrir o app (fallback)
      `mbway://`,

      // Versão alternativa do intent
      `intent://pay?phone=${phoneNumber}#Intent;scheme=mbway;action=android.intent.action.VIEW;package=pt.sibs.mbway;end`
    ];

    // Tenta múltiplas abordagens
    let appOpened = false;
    for (const url of urlsToTry) {
      console.log('Tentando MB WAY URL:', url);
      appOpened = await attemptOpenApp(url);

      if (appOpened) {
        console.log('✅ MB WAY provavelmente abriu com URL:', url);
        break;
      }

      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Feedback baseado no resultado da tentativa
    if (isMobile) {
      if (appOpened) {
        showToast({
          type: 'success',
          title: 'MB WAY aberto!',
          message: 'Confirme o pagamento no aplicativo.',
          duration: 4000
        });
      } else {
        showToast({
          type: 'warning',
          title: 'App não abriu automaticamente',
          message: `${phoneNumber} copiado - Abra o MB WAY manualmente para confirmar seu dízimo/oferta.`,
          duration: 8000,
          action: {
            label: 'Copiar número',
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(phoneNumber);
                showToast({
                  type: 'success',
                  title: 'Número copiado!',
                  message: phoneNumber,
                  duration: 2000
                });
              } catch {
                showToast({
                  type: 'error',
                  title: 'Erro',
                  message: 'Não foi possível copiar automaticamente.',
                  duration: 3000
                });
              }
            }
          }
        });
      }
    } else {
      // Desktop
      showToast({
        type: 'info',
        title: 'MB WAY',
        message: appOpened ? 'App provavelmente aberto!' : 'Tentativa concluída - verifique se o app abriu.',
        duration: 3000
      });
    }
  };

  return (
    <section className="card bg-white/5 backdrop-blur rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-3">Uma Palavra para hoje</h2>
      <div className="text-white/90 text-lg leading-relaxed mb-4 min-h-[60px]">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Carregando versículo...</span>
          </div>
        ) : (
          currentVerse
        )}
      </div>
      <button 
        onClick={getRandomVerse}
        disabled={isLoading}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Carregando...' : 'Outro versículo'}
      </button>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="font-medium text-white/90">Beneficiário</h3>
          <p className="text-white/80 text-sm">CONTA ECONOMIA SOCIAL</p>
          <button 
            onClick={(e) => copyToClipboard('CONTA ECONOMIA SOCIAL', e.target as HTMLButtonElement)}
            className="mt-2 text-sm px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Copiar nome
          </button>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="font-medium text-white/90">IBAN</h3>
          <p className="text-white/80 text-sm break-all">PT50003604079910602581786</p>
          <button 
            onClick={(e) => copyToClipboard('PT50003604079910602581786', e.target as HTMLButtonElement)}
            className="mt-2 text-sm px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Copiar IBAN
          </button>
        </div>
        
        
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="font-medium text-white/90">Partilhar</h3>
          <p className="text-white/80 text-sm">Envie os dados para alguém.</p>
          <button
            onClick={shareData}
            className="mt-2 text-sm px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Partilhar
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="font-medium text-white/90">MB WAY</h3>
          <p className="text-white/80 text-sm">Pagamento rápido e seguro.</p>
          <div className="mt-2 space-y-2">
            {/* Opção avançada - Modal */}
            {/*<button
              onClick={() => setIsMBWayModalOpen(true)}
              className="w-full text-sm px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <text x="12" y="8" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">MB</text>
                <text x="12" y="18" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">WAY</text>
              </svg>
              Solicitar Pagamento
            </button>*/}

            {/* Opção tradicional - Deep Link */}
            <button
              onClick={() => openMBWay('965169925')}
              className="w-full text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Abrir App MB WAY
            </button>
          </div>
        </div>
      </div>
      
      {/* Instruções destacadas */}
      <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Como fazer sua a sua oferta
        </h3>
        <div className="space-y-3 text-white/90">
          <div className="flex items-start gap-3">
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
            <p><strong>Copie o IBAN</strong> acima</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
            <p><strong>Abra o aplicativo do seu banco</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
            <p>Vá em <strong>Transferir</strong> ou <strong>Transferências (SEPA)</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
            <p><strong>Cole o IBAN</strong>, digite o valor que quer ofertar e finalize a operação</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🙏</span>
            <h4 className="font-semibold text-green-100">Obrigado pela sua generosidade!</h4>
          </div>
          <p className="text-green-100/90 text-sm italic">
            "Cada um contribua segundo propôs no coração, não com tristeza ou por necessidade; 
            porque Deus ama ao que dá com alegria." — 2 Coríntios 9:7
          </p>
        </div>
      </div>

      {/* Modal MB WAY */}
      <MBWayModal
        isOpen={isMBWayModalOpen}
        onClose={() => setIsMBWayModalOpen(false)}
      />
    </section>
  );
};

export default VerseSection;