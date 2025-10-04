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
    // Tenta abrir o app MB WAY com deep link
    const mbwayUrl = `mbway://pay?phone=${phoneNumber}`;

    // Tenta abrir o app
    window.location.href = mbwayUrl;

    // Se não conseguir abrir o app após um tempo, copia o número
    setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        alert(`MB WAY não está instalado. Número ${phoneNumber} copiado para a área de transferência.`);
      } catch {
        alert(`Instale o app MB WAY primeiro. Número: ${phoneNumber}`);
      }
    }, 1000);
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
            onClick={() => openMBWay('912345678')} // ⚠️ SUBSTITUA PELO NÚMERO REAL DA IGREJA
            className="mt-2 text-sm px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8v-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
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