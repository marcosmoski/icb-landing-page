import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { LegalList, LegalSection, LegalTable } from './LegalLayout';
import { CHURCH_DETAILS } from '@/lib/legal';

const PrivacyPolicyPage: React.FC = () => (
  <LegalLayout
    currentPath="/privacidade"
    title="Política de Privacidade"
    intro="Explicamos aqui, sem rodeios, que dados recolhemos neste site, para que servem, com quem são partilhados e como pode pedir para os apagar."
  >
    <LegalSection title="1. Quem é responsável pelos seus dados">
      <p>
        O responsável pelo tratamento dos dados recolhidos neste site é a{' '}
        <strong className="text-slate-100">{CHURCH_DETAILS.legalName}</strong>, com sede em{' '}
        {CHURCH_DETAILS.address}.
      </p>
      <p>
        Para qualquer assunto relacionado com os seus dados pessoais, incluindo o exercício dos
        direitos descritos no ponto 7, contacte-nos por e-mail para{' '}
        <a href={`mailto:${CHURCH_DETAILS.email}`} className="text-blue-300 hover:underline">
          {CHURCH_DETAILS.email}
        </a>{' '}
        ou pelo telefone {CHURCH_DETAILS.phone}.
      </p>
    </LegalSection>

    <LegalSection title="2. Que dados recolhemos e porquê">
      <p>
        Só recolhemos dados que nos dê voluntariamente ao preencher um dos formulários do site. Não
        compramos listas, não usamos publicidade comportamental e não vendemos dados a ninguém.
      </p>

      <LegalTable
        headers={['Onde', 'Dados', 'Para quê', 'Fundamento legal']}
        rows={[
          [
            'Cadastro de membros',
            'Nome, e-mail, telefone, data de nascimento, se é batizado e a mensagem que escrever',
            'Acolher quem quer fazer parte da comunidade e entrar em contacto',
            'Consentimento (art. 6.º, n.º 1, al. a) do RGPD)',
          ],
          [
            'Pedidos de oração',
            'Nome, telefone e/ou e-mail, data de nascimento, se é batizado, o pedido escrito e a preferência de visita',
            'Orar pelo seu pedido e, se pedir, fazer acompanhamento pastoral',
            'Consentimento explícito (art. 9.º, n.º 2, al. a) — ver ponto 3)',
          ],
          [
            'Pesquisas internas',
            'Os campos que a pesquisa indicar (habitualmente nome e telefone) e as suas respostas',
            'Organizar equipas, escalas e atividades da igreja',
            'Consentimento (art. 6.º, n.º 1, al. a) do RGPD)',
          ],
          [
            'Dízimos e ofertas (MB WAY)',
            'Número de telemóvel e valor, apenas para abrir a aplicação MB WAY',
            'Concluir o donativo na aplicação do seu banco',
            'Execução do donativo a seu pedido',
          ],
        ]}
      />

      <p>
        No caso dos dízimos e ofertas, esses dados <strong className="text-slate-100">não são
        guardados</strong> nos nossos sistemas: servem apenas para abrir a aplicação MB WAY no seu
        telemóvel. A transação decorre entre si e o seu banco.
      </p>
    </LegalSection>

    <LegalSection title="3. Dados sensíveis: pedidos de oração">
      <p>
        Um pedido de oração revela convicções religiosas e, muitas vezes, informação sobre saúde,
        família ou situação financeira. O RGPD classifica isto como categoria especial de dados
        (art. 9.º) e exige o seu <strong className="text-slate-100">consentimento explícito</strong>,
        que dá ao enviar o formulário.
      </p>
      <p>
        Estes pedidos são acedidos apenas pela liderança pastoral e pela equipa de intercessão, são
        tratados com discrição e nunca são divulgados publicamente, lidos em culto ou partilhados
        com terceiros sem que nos peça isso.
      </p>
    </LegalSection>

    <LegalSection title="4. Durante quanto tempo guardamos">
      <LegalList
        items={[
          <>
            <strong className="text-slate-100">Cadastro de membros:</strong> enquanto mantiver ligação
            à comunidade, ou até nos pedir para apagar.
          </>,
          <>
            <strong className="text-slate-100">Pedidos de oração:</strong> até 24 meses após o
            atendimento do pedido.
          </>,
          <>
            <strong className="text-slate-100">Respostas a pesquisas:</strong> até 12 meses após o
            encerramento da pesquisa.
          </>,
        ]}
      />
      <p>Findos estes prazos, os dados são eliminados. Pode pedir a eliminação antes disso.</p>
    </LegalSection>

    <LegalSection title="5. Quem tem acesso">
      <p>
        Internamente, apenas a liderança e as pessoas da equipa que precisam dos dados para a
        respetiva função, através de contas de acesso individuais e protegidas por palavra-passe.
      </p>
      <p>
        Externamente, recorremos a prestadores de serviços que tratam dados por nossa conta
        (subcontratantes), todos com garantias de conformidade com o RGPD:
      </p>
      <LegalTable
        headers={['Serviço', 'Para quê']}
        rows={[
          ['Supabase', 'Base de dados onde os formulários ficam guardados e autenticação da equipa'],
          ['Vercel', 'Alojamento do site'],
          ['Resend', 'Envio do e-mail que avisa a equipa de um novo pedido de oração'],
          ['Juicer.io', 'Mostra as publicações do Instagram na página inicial'],
        ]}
      />
      <p>
        Alguns destes prestadores podem tratar dados fora do Espaço Económico Europeu. Nesses casos, a
        transferência é feita ao abrigo das Cláusulas Contratuais-Tipo aprovadas pela Comissão
        Europeia.
      </p>
      <p>
        Só partilhamos dados com autoridades públicas quando a lei nos obrigue.
      </p>
    </LegalSection>

    <LegalSection title="6. Segurança">
      <p>
        Os dados circulam sempre por ligação cifrada (HTTPS) e ficam numa base de dados com regras de
        acesso por linha: os formulários públicos podem escrever, mas apenas contas expressamente
        autorizadas conseguem ler o que foi enviado. As pesquisas são acessíveis por um link privado,
        que só quem o recebe consegue abrir.
      </p>
    </LegalSection>

    <LegalSection title="7. Os seus direitos">
      <p>Enquanto titular dos dados, tem o direito de:</p>
      <LegalList
        items={[
          'Saber que dados temos sobre si e obter uma cópia (acesso);',
          'Corrigir dados errados ou incompletos (retificação);',
          'Pedir que os apaguemos (apagamento);',
          'Pedir que limitemos ou que nos opormos ao tratamento;',
          'Receber os seus dados num formato que possa reutilizar (portabilidade);',
          'Retirar o consentimento a qualquer momento, sem que isso afete o que foi feito antes.',
        ]}
      />
      <p>
        Para exercer qualquer um destes direitos, escreva para{' '}
        <a href={`mailto:${CHURCH_DETAILS.email}`} className="text-blue-300 hover:underline">
          {CHURCH_DETAILS.email}
        </a>
        . Respondemos no prazo máximo de um mês.
      </p>
      <p>
        Se entender que não tratámos o assunto como devíamos, pode apresentar reclamação à{' '}
        <a
          href="https://www.cnpd.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:underline"
        >
          Comissão Nacional de Proteção de Dados (CNPD)
        </a>
        .
      </p>
    </LegalSection>

    <LegalSection title="8. Menores">
      <p>
        Os formulários deste site destinam-se a maiores de 16 anos. Se for menor dessa idade, peça a
        um dos pais ou a quem exerça as responsabilidades parentais que preencha por si. Se
        detetarmos que recolhemos dados de um menor sem essa autorização, eliminamo-los.
      </p>
    </LegalSection>

    <LegalSection title="9. Cookies">
      <p>
        O site usa um número mínimo de cookies e tecnologias equivalentes. Explicamos quais e para que
        servem na{' '}
        <Link to="/cookies" className="text-blue-300 hover:underline">
          Política de Cookies
        </Link>
        .
      </p>
    </LegalSection>

    <LegalSection title="10. Alterações a esta política">
      <p>
        Se mudarmos alguma coisa relevante, atualizamos esta página e a data de última atualização no
        topo. Recomendamos que a consulte de vez em quando.
      </p>
    </LegalSection>
  </LegalLayout>
);

export default PrivacyPolicyPage;
