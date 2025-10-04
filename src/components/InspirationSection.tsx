import React from 'react';

const InspirationSection: React.FC = () => {
  return (
    <section className="card bg-white/5 backdrop-blur rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-4">Uma Bênção Especial</h2>

      <div className="relative overflow-hidden rounded-2xl mb-6">
        <img
          src="/jesus.png"
          alt="Pessoa abraçando Jesus - representação espiritual"
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-sm md:text-base font-medium leading-relaxed">
            "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso."
          </p>
          <p className="text-xs md:text-sm opacity-90 mt-1">— Mateus 11:28</p>
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
