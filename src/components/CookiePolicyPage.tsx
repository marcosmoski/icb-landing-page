import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { LegalSection, LegalTable } from './LegalLayout';
import { clearCookieConsent } from '@/hooks/useCookieConsent';

const CookiePolicyPage: React.FC = () => (
  <LegalLayout
    currentPath="/cookies"
    title="Política de Cookies"
    intro="Este site usa o mínimo possível de cookies. Não temos publicidade, não fazemos rastreio entre sites e não usamos ferramentas de análise de audiência."
  >
    <LegalSection title="1. O que são cookies">
      <p>
        Cookies são pequenos ficheiros que um site guarda no seu navegador para se lembrar de
        alguma coisa entre visitas. Neste site usamos também o armazenamento local do navegador
        (<em>localStorage</em>), que funciona de forma parecida: a informação fica no seu aparelho e
        não é enviada para nós.
      </p>
    </LegalSection>

    <LegalSection title="2. O que usamos, exatamente">
      <LegalTable
        headers={['Nome', 'Tipo', 'Para que serve', 'Duração']}
        rows={[
          [
            'sb-*-auth-token',
            'Estritamente necessário',
            'Mantém a sessão iniciada de quem faz parte da equipa e acede à área de administração. Não é criado a quem apenas visita o site.',
            'Até terminar sessão',
          ],
          [
            'lastPrayerRequestSubmit',
            'Estritamente necessário',
            'Guarda a hora do seu último pedido de oração para evitar envios repetidos por engano.',
            '1 minuto',
          ],
          [
            'icb-cookie-consent',
            'Estritamente necessário',
            'Guarda a escolha que fez no aviso de cookies, para não voltarmos a perguntar.',
            '6 meses',
          ],
          [
            'Cookies do Juicer.io',
            'Conteúdo externo (requer consentimento)',
            'O feed do Instagram na página inicial é carregado pelo serviço Juicer.io, que pode colocar cookies próprios. Só o carregamos se aceitar.',
            'Definida pelo Juicer.io',
          ],
        ]}
      />
      <p>
        Os cookies estritamente necessários não precisam de consentimento, porque sem eles o site não
        funciona como espera. Todos os outros só são usados se os aceitar.
      </p>
    </LegalSection>

    <LegalSection title="3. O que não usamos">
      <p>
        Não usamos Google Analytics nem qualquer outra ferramenta de medição de audiência. Não usamos
        píxeis de publicidade do Facebook, do Google ou de outra plataforma. Não criamos perfis sobre
        si nem partilhamos o seu comportamento de navegação com terceiros.
      </p>
    </LegalSection>

    <LegalSection title="4. Como mudar a sua escolha">
      <p>
        Pode rever a decisão que tomou no aviso de cookies a qualquer momento:
      </p>
      <button
        onClick={clearCookieConsent}
        className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-100 transition-colors"
      >
        Rever as minhas preferências de cookies
      </button>
      <p>
        Pode também apagar e bloquear cookies nas definições do seu navegador. Se bloquear tudo, o
        site continua a funcionar, mas terá de iniciar sessão de novo em cada visita à área de
        administração e o feed do Instagram não será mostrado.
      </p>
    </LegalSection>

    <LegalSection title="5. Mais informação">
      <p>
        Para perceber como tratamos os dados que nos envia pelos formulários, consulte a{' '}
        <Link to="/privacidade" className="text-blue-300 hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </LegalSection>
  </LegalLayout>
);

export default CookiePolicyPage;
