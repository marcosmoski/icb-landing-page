import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { LegalList, LegalSection } from './LegalLayout';
import { CHURCH_DETAILS } from '@/lib/legal';

const TermsPage: React.FC = () => (
  <LegalLayout
    currentPath="/termos"
    title="Termos e Condições"
    intro="As regras de utilização do site da ICB Gaia. Ao usar o site, está a aceitar o que se segue."
  >
    <LegalSection title="1. Quem somos">
      <p>
        Este site é propriedade da <strong className="text-slate-100">{CHURCH_DETAILS.legalName}</strong>,
        com sede em {CHURCH_DETAILS.address}, e destina-se a divulgar as atividades da comunidade e a
        facilitar o contacto com quem nos procura.
      </p>
    </LegalSection>

    <LegalSection title="2. Utilização do site">
      <p>O site é de acesso livre e gratuito. Ao utilizá-lo, compromete-se a:</p>
      <LegalList
        items={[
          'Fornecer informação verdadeira nos formulários que preencher;',
          'Não enviar conteúdo ilegal, ofensivo, difamatório ou que viole direitos de terceiros;',
          'Não submeter dados pessoais de outra pessoa sem que ela saiba e concorde;',
          'Não tentar aceder a áreas reservadas, nem interferir com o funcionamento do site.',
        ]}
      />
      <p>
        Reservamo-nos o direito de eliminar conteúdos que violem estas regras e de bloquear o acesso a
        quem o faça de forma repetida.
      </p>
    </LegalSection>

    <LegalSection title="3. Pedidos de oração e pesquisas">
      <p>
        Os pedidos de oração são recebidos e tratados pela equipa pastoral com discrição. Não são um
        serviço de emergência nem substituem aconselhamento médico, psicológico ou jurídico. Se
        estiver em situação de emergência, contacte o 112.
      </p>
      <p>
        As pesquisas internas destinam-se à organização da comunidade e são divulgadas por link
        privado. Ao responder, autoriza-nos a usar as suas respostas para essa finalidade, nos termos
        da{' '}
        <Link to="/privacidade" className="text-blue-300 hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </LegalSection>

    <LegalSection title="4. Dízimos e ofertas">
      <p>
        Os dízimos e ofertas entregues através deste site são{' '}
        <strong className="text-slate-100">contribuições voluntárias</strong> para o sustento da obra
        da igreja. Não correspondem à compra de qualquer bem ou serviço e, por isso, não conferem
        direito a contrapartida.
      </p>
      <p>
        O pagamento é concluído na aplicação MB WAY do seu banco: não processamos nem guardamos dados
        de pagamento. Se fizer uma transferência por engano ou com valor errado, contacte-nos por{' '}
        <a href={`mailto:${CHURCH_DETAILS.email}`} className="text-blue-300 hover:underline">
          {CHURCH_DETAILS.email}
        </a>{' '}
        e procuraremos resolver a situação.
      </p>
    </LegalSection>

    <LegalSection title="5. Propriedade intelectual">
      <p>
        Os textos, imagens, o logótipo e a identidade visual deste site pertencem à ICB Gaia ou são
        usados com autorização. Pode partilhar as nossas páginas e conteúdos para fins pessoais e não
        comerciais, indicando a origem. Qualquer outra utilização carece de autorização escrita.
      </p>
    </LegalSection>

    <LegalSection title="6. Ligações para outros sites">
      <p>
        O site contém ligações para serviços de terceiros, como o Instagram e o MB WAY. Não
        controlamos esses serviços e não somos responsáveis pelos seus conteúdos nem pelas suas
        políticas de privacidade.
      </p>
    </LegalSection>

    <LegalSection title="7. Disponibilidade e responsabilidade">
      <p>
        Fazemos o possível para manter o site disponível e a informação correta e atualizada, mas não
        garantimos funcionamento ininterrupto nem ausência de erros. Podemos suspender o serviço para
        manutenção ou alterar conteúdos sem aviso prévio.
      </p>
      <p>
        Dentro dos limites permitidos por lei, não somos responsáveis por danos indiretos resultantes
        da utilização ou da impossibilidade de utilização do site.
      </p>
    </LegalSection>

    <LegalSection title="8. Alterações a estes termos">
      <p>
        Estes termos podem ser atualizados. A versão em vigor é sempre a publicada nesta página, com a
        data de última atualização indicada no topo.
      </p>
    </LegalSection>

    <LegalSection title="9. Lei aplicável e foro">
      <p>
        Aplica-se a lei portuguesa. Para a resolução de qualquer litígio emergente destes termos é
        competente o foro da comarca do Porto, com expressa renúncia a qualquer outro.
      </p>
      <p>
        Nos termos da legislação de resolução alternativa de litígios de consumo, pode recorrer à
        plataforma europeia de resolução de litígios em linha, disponível em{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:underline"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </LegalSection>
  </LegalLayout>
);

export default TermsPage;
