import React from 'react';

const InspirationSection: React.FC = () => {
  return (
    <section className="card bg-white/5 backdrop-blur rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-4">Uma Bênção Especial</h2>

      <div className="relative overflow-hidden rounded-2xl mb-6">
        <img
          src="/icb_dizimos.png"
          alt="Imagem dizimos e ofertas"
          className="w-full h-100 md:h-100 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-black/90 text-sm md:text-base font-bold leading-relaxed">
            "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, 
            e depois fazei prova de mim nisto, diz o Senhor dos Exércitos, 
            se eu não vos abrir as janelas do céu, 
            e não derramar sobre vós uma bênção tal até que não haja lugar suficiente para a recolherdes."
          </p>
          <p className="text-black/90 text-xs md:text-sm opacity-90 font-bold mt-1">— Malaquias 3:10</p>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Sua oferta é uma bênção
        </h3>
        <p className="text-white/80 leading-relaxed">
          Cada contribuição ajuda nossa igreja a levar esperança, amor e apoio para mais famílias
          em nossa comunidade. Obrigado por fazer parte desta missão de fé e caridade.
        </p>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <h4 className="font-semibold text-yellow-100">Impacto Real</h4>
          </div>
          <p className="text-yellow-100/90 text-sm">
            Suas ofertas ajudam na manutenção do templo, apoio às famílias carentes,
            estudos bíblicos e projetos missionários.
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-white/70 text-sm italic">
            "Deem, e lhes será dado: uma medida boa, recalcada, sacudida e transbordante
            lhes será dada ao regaço; porque com a mesma medida com que medirem também
            vos medirão de volta." — Lucas 6:38
          </p>
        </div>
      </div>
    </section>
  );
};

export default InspirationSection;
