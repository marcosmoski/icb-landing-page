import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    { src: '/pastor-jaider.jpg', alt: 'Pastor Jaider', caption: 'Pastor Jaider' },
    { src: '/pastora-regiane.jpg', alt: 'Pastora Regiane', caption: 'Pastora Regiane Carvalho' },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section com Carrossel */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Carrossel de Imagens */}
        <div className="relative h-full bg-gray-900">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-950"></div>
            </div>
          ))}

          {/* Controles do Carrossel */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"
            aria-label="Imagem anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"
            aria-label="Próxima imagem"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>

          {/* Texto sobre o carrossel */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                Bem-vindo à ICB Gaia
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
                Igreja Casa da Bênção - Vila Nova de Gaia
              </p>
              <p className="text-lg text-white/80 italic">
                {carouselImages[currentImageIndex].caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Informações da Igreja */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Sobre Nós */}
          <div className="card bg-white/5 backdrop-blur rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-4xl">⛪</span>
              Sobre Nós
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              A Igreja Casa da Bênção (ICB) é uma comunidade cristã dedicada a compartilhar o amor de Deus e transformar vidas através da palavra e do louvor.
            </p>
            <p className="text-white/80 text-lg leading-relaxed">
              Somos uma família que acolhe a todos com amor e respeito, buscando crescer juntos na fé e no serviço ao próximo.
            </p>
          </div>

          {/* Localização */}
          <div className="card bg-white/5 backdrop-blur rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-4xl">📍</span>
              Onde Estamos
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-medium">Endereço</p>
                  <p className="text-white/70">Rua João de Deus, 191</p>
                  <p className="text-white/70">Vila Nova de Gaia, Portugal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horários das Reuniões */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="card bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur rounded-3xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
            <span className="text-4xl">📅</span>
            Nossas Reuniões
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
              <div className="text-3xl mb-3">🙏</div>
              <h3 className="text-xl font-bold text-white mb-2">Quartas-feiras</h3>
              <p className="text-2xl font-bold text-blue-400">20:30</p>
              <p className="text-white/70 text-sm mt-2">Culto de Oração</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="text-xl font-bold text-white mb-2">Sextas-feiras</h3>
              <p className="text-2xl font-bold text-blue-400">20:00</p>
              <p className="text-white/70 text-sm mt-2">Estudo Bíblico</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-xl font-bold text-white mb-2">Domingos</h3>
              <p className="text-2xl font-bold text-blue-400">19:00</p>
              <p className="text-white/70 text-sm mt-2">Culto de Celebração</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pastores */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Nossos Pastores</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card bg-white/5 backdrop-blur rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-blue-500/50">
              <img src="/pastor-jaider.jpg" alt="Pastor Jaider" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pastor Jaider</h3>
            <a
              href="https://instagram.com/jaider3614"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @jaider3614
            </a>
          </div>
          <div className="card bg-white/5 backdrop-blur rounded-3xl p-8 text-center hover:bg-white/10 transition-colors">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-purple-500/50">
              <img src="/pastora-regiane.jpg" alt="Pastora Regiane" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pastora Regiane Carvalho</h3>
            <a
              href="https://instagram.com/regiane_carvalho79"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @regiane_carvalho79
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="card bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Venha nos visitar!</h2>
          <p className="text-xl text-white/90 mb-8">
            Você é sempre bem-vindo em nossa casa. Esperamos por você!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/cadastro"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
            >
              Fazer Cadastro
            </a>
            <a
              href="/dizimos"
              className="px-8 py-4 bg-white/20 backdrop-blur text-white rounded-xl font-bold hover:bg-white/30 transition-colors"
            >
              Contribuir com Dízimos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
