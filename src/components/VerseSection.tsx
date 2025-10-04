import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface BibleVerse {
  text: string;
  reference: string;
}

const VerseSection: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const text = `Doação — Igreja ICB\nBeneficiário: RESGATAR INDICES - ASSOCIAÇÃO\nIBAN: PT50003604079910602581786`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Doações — Igreja ICB', text });
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
    // Primeiro copia o número (sempre funciona)
    try {
      await navigator.clipboard.writeText(phoneNumber);
    } catch {
      alert(`Copie este número: ${phoneNumber}`);
    }

    // Detecta o sistema operacional
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    try {
      // Uma tentativa de deep link baseada no SO
      const deepLink = `mbway://pay?phone=${phoneNumber}`;

      if (isIOS) {
        // iOS: usa location.href (mais confiável)
        window.location.href = deepLink;
      } else if (isAndroid) {
        // Android: tenta location.href primeiro
        window.location.href = deepLink;
      } else {
        // Desktop: abre em nova aba
        window.open(deepLink, '_blank');
      }

    } catch (error) {
      console.log('Erro ao tentar abrir MB WAY:', error);
    }

    // Mostra mensagem com instruções claras
    alert(`✅ Número ${phoneNumber} copiado para a área de transferência!

📱 Tentativa de abrir o app MB WAY realizada!

🔄 Próximos passos:
1. Verifique se o app MB WAY abriu automaticamente
2. Se não abriu, abra o app manualmente
3. Cole o número copiado e confirme a doação

💚 Obrigado pela sua contribuição!`);
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
          <button
            onClick={() => openMBWay('965169925')}
            className="mt-2 text-sm px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <text x="12" y="8" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">MB</text>
              <text x="12" y="18" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">WAY</text>
            </svg>
            Pagar com MB WAY
          </button>
        </div>
      </div>
      
      {/* Instruções destacadas */}
      <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Como fazer sua doação
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
            <p><strong>Cole o IBAN</strong>, digite o valor que quer doar e finalize a operação</p>
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
    </section>
  );
};

export default VerseSection;