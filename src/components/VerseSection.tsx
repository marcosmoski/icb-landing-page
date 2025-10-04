import React, { useState, useEffect, useCallback } from 'react';

const VerseSection: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState('');

  const verses = [
    '"O Senhor é o meu pastor; nada me faltará." — Salmo 23:1',
    '"Buscai primeiro o Reino de Deus..." — Mateus 6:33',
    '"Tudo posso naquele que me fortalece." — Filipenses 4:13',
    '"Lâmpada para os meus pés é a tua palavra..." — Salmo 119:105',
    '"Entrega o teu caminho ao Senhor; confia nele..." — Salmo 37:5',
  ];

  const getRandomVerse = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    setCurrentVerse(verses[randomIndex]);
  }, [verses]);

  useEffect(() => {
    getRandomVerse();
  }, [getRandomVerse]);

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
    const text = `Doação — Igreja\nBeneficiário: CONTA ECONOMIA SOCIAL\nIBAN: PT50003604079910602581786\nBIC: MPIOPTPL`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Doações — Igreja', text });
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

  return (
    <section className="card bg-white/5 backdrop-blur rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-3">Uma Palavra para hoje</h2>
      <div className="text-white/90 text-lg leading-relaxed mb-4">
        {currentVerse}
      </div>
      <button 
        onClick={getRandomVerse}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
      >
        Outro versículo
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
          <h3 className="font-medium text-white/90">BIC / SWIFT</h3>
          <p className="text-white/80 text-sm">MPIOPTPL</p>
          <button 
            onClick={(e) => copyToClipboard('MPIOPTPL', e.target as HTMLButtonElement)}
            className="mt-2 text-sm px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Copiar BIC
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
      </div>
      
      <p className="text-white/60 text-xs mt-6">
        Dica: se o seu app não reconhecer o QR, copie o IBAN e use transferência normal.
      </p>
    </section>
  );
};

export default VerseSection;
