"use client"
import Link from "next/link";
import Button from "../../components/Button";
import { useEffect } from "react";

const sections = [
  { id: "1", title: "1. Informações do Responsável" },
  { id: "2", title: "2. Âmbito e Aplicação" },
  { id: "3", title: "3. Dados Pessoais Recolhidos" },
  { id: "4", title: "4. Como Recolhemos os Seus Dados" },
  { id: "5", title: "5. Finalidades do Tratamento" },
  { id: "6", title: "6. Partilha de Dados" },
  { id: "7", title: "7. Segurança dos Dados" },
  { id: "8", title: "8. Os Seus Direitos" },
  { id: "9", title: "9. Cookies e Tecnologias Similares" },
  { id: "10", title: "10. Retenção de Dados" },
  { id: "11", title: "11. Menores de Idade" },
  { id: "12", title: "12. Violações de Dados" },
  { id: "13", title: "13. Alterações a esta Política" },
  { id: "14", title: "14. Contactos e Reclamações" },
  { id: "15", title: "15. Informações Legais" },
];

export default function PrivacyPage() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Política de Privacidade - Heed</h1>
            <Link href="/">
              <Button variant="secondary" size="sm" className="ml-4">Voltar</Button>
            </Link>
          </div>
          <div className="text-gray-600 text-sm mb-6">
            <b>Última atualização:</b> 09/07/2025<br/>
            <b>Versão:</b> 1.0
          </div>

          {/* Índice de Secções */}
          <nav className="mb-10">
            <ul className="space-y-2 text-sm md:text-base">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="prose prose-gray max-w-none text-gray-800">
            {/* 1. Informações do Responsável */}
            <section id="1" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. INFORMAÇÕES DO RESPONSÁVEL PELO TRATAMENTO</h2>
              <p><b>Responsável pelo tratamento:</b> João Mota<br/>
                <b>Morada:</b> Rua Óscar Dias Pereira, 80<br/>
                <b>NIF:</b> 917730529<br/>
                <b>Email:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a><br/>
                <b>Telefone:</b> 917730529
              </p>
              <p className="mt-4"><b>Encarregado de Proteção de Dados (DPO):</b><br/>
                <b>Nome:</b> João Mota<br/>
                <b>Email:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a><br/>
                <b>Telefone:</b> 917730529
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <b>⚠️ Nota sobre independência:</b> O DPO é também o responsável pelo tratamento. Para garantir a independência necessária ao exercício das funções de DPO, questões complexas de proteção de dados são subcontratadas a consultoria jurídica externa especializada.
              </div>
            </section>

            {/* 2. Âmbito e Aplicação */}
            <section id="2" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. ÂMBITO E APLICAÇÃO</h2>
              <p>Esta Política de Privacidade aplica-se ao tratamento de dados pessoais recolhidos através da aplicação web <b>Heed</b> (disponível em <a href="https://myheed.app" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://myheed.app</a>), destinada a psicólogos para gestão de pacientes e prática clínica.</p>
              <p><b>Tipos de utilizadores abrangidos:</b></p>
              <ul className="list-disc pl-6">
                <li><b>Psicólogos e profissionais de saúde mental</b> (utilizadores diretos da aplicação)</li>
                <li><b>Pacientes</b> (cujos dados pessoais são inseridos e tratados pelos psicólogos através da aplicação)</li>
                <li><b>Visitantes do website</b> (que acedem apenas a informações públicas sem criar conta)</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <b>⚠️ Nota importante para pacientes:</b> Embora não utilize diretamente esta aplicação, os seus dados pessoais podem ser tratados através da mesma pelo seu psicólogo. Esta política explica como os seus dados são protegidos e quais os seus direitos.
              </div>
            </section>

            {/* 3. Dados Pessoais Recolhidos */}
            <section id="3" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. DADOS PESSOAIS RECOLHIDOS</h2>
              <h3 className="text-lg font-semibold mt-6">3.1 Dados dos Psicólogos/Utilizadores Principais</h3>
              <ul className="list-disc pl-6">
                <li>Nome completo (primeiro e último nome)</li>
                <li>Endereço de email</li>
                <li>Palavra-passe (encriptada)</li>
                <li>Dados de autenticação Google (se aplicável)</li>
                <li>Data de criação da conta</li>
                <li>Dados de acesso (logs de login, IP, timestamps)</li>
              </ul>
              <p><b>Base legal:</b> Execução de contrato (Art. 6.º, n.º 1, alínea b) RGPD)<br/>
                <b>Finalidade:</b> Prestação do serviço, autenticação e gestão da conta<br/>
                <b>Prazo de conservação:</b> Duração da conta + 5 anos
              </p>
              <h3 className="text-lg font-semibold mt-6">3.2 Dados dos Pacientes (Dados de Saúde - Categoria Especial)</h3>
              <div className="mt-2 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <b>⚠️ ATENÇÃO: Dados sensíveis de saúde</b>
              </div>
              <ul className="list-disc pl-6 mt-2">
                <li><b>Dados de identificação:</b>
                  <ul className="list-disc pl-6">
                    <li>Nome completo (primeiro e último nome)</li>
                    <li>Email (opcional)</li>
                    <li>Telefone (opcional)</li>
                    <li>Data de nascimento</li>
                    <li>Morada (opcional)</li>
                    <li>Número de contribuinte (opcional)</li>
                  </ul>
                </li>
                <li><b>Dados clínicos e de saúde:</b>
                  <ul className="list-disc pl-6">
                    <li>Notas de sessões terapêuticas</li>
                    <li>Planos de tratamento</li>
                    <li>Registos de consultas e sessões</li>
                    <li>Estado das sessões (agendada, realizada, cancelada)</li>
                    <li>Informações sobre pagamentos das sessões</li>
                    <li>Qualquer informação clínica inserida pelo psicólogo</li>
                  </ul>
                </li>
              </ul>
              <p><b>Base legal:</b><br/>
                - Art. 9.º, n.º 2, alínea h) RGPD (prestação de cuidados de saúde)<br/>
                - Art. 6.º, n.º 1, alínea b) RGPD (execução de contrato)<br/>
                - Consentimento explícito do titular (Art. 9.º, n.º 2, alínea a) RGPD)
              </p>
              <p><b>Finalidade:</b><br/>
                - Prestação de cuidados de saúde psicológica<br/>
                - Gestão de consultas e tratamentos<br/>
                - Cumprimento de obrigações legais profissionais<br/>
                - Gestão financeira das sessões
              </p>
              <p><b>Prazo de conservação:</b> 10 anos após a última consulta (obrigação legal profissional)</p>
              <h3 className="text-lg font-semibold mt-6">3.3 Dados Financeiros</h3>
              <ul className="list-disc pl-6">
                <li>Valor das sessões</li>
                <li>Estado de pagamento</li>
                <li>Datas de faturação</li>
                <li>Informações para emissão de faturas</li>
              </ul>
              <p><b>Base legal:</b><br/>
                - Execução de contrato (Art. 6.º, n.º 1, alínea b) RGPD)<br/>
                - Cumprimento de obrigação legal (Art. 6.º, n.º 1, alínea c) RGPD - obrigações fiscais)
              </p>
              <p><b>Finalidade:</b> Gestão financeira, faturação, cumprimento de obrigações fiscais<br/>
                <b>Prazo de conservação:</b> 10 anos (obrigação fiscal)
              </p>
            </section>

            {/* 4. Como Recolhemos os Seus Dados */}
            <section id="4" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. COMO RECOLHEMOS OS SEUS DADOS</h2>
              <h3 className="text-lg font-semibold mt-6">4.1 Recolha Direta</h3>
              <ul className="list-disc pl-6">
                <li><b>Registo na aplicação:</b> Dados fornecidos voluntariamente pelo utilizador</li>
                <li><b>Utilização da aplicação:</b> Dados inseridos durante o uso normal</li>
                <li><b>Contactos:</b> Dados fornecidos ao contactar-nos</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">4.2 Recolha Automática</h3>
              <ul className="list-disc pl-6">
                <li><b>Logs de sistema:</b> Endereços IP, timestamps, ações realizadas</li>
                <li><b>Cookies técnicos:</b> Necessários para funcionamento da aplicação</li>
                <li><b>Dados de autenticação:</b> Tokens de sessão, dados de login</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">4.3 Autenticação Google</h3>
              <ul className="list-disc pl-6">
                <li>Nome e email do perfil Google</li>
                <li>ID único do utilizador Google</li>
                <li>Foto de perfil (se disponível)</li>
              </ul>
            </section>

            {/* 5. Finalidades do Tratamento */}
            <section id="5" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. FINALIDADES DO TRATAMENTO</h2>
              <h3 className="text-lg font-semibold mt-6">5.1 Finalidades Principais</h3>
              <ul className="list-disc pl-6">
                <li><b>Prestação do serviço:</b> Funcionamento da aplicação Heed</li>
                <li><b>Gestão de contas:</b> Criação, manutenção e suporte de contas</li>
                <li><b>Prestação de cuidados de saúde:</b> Suporte à prática clínica dos psicólogos</li>
                <li><b>Gestão de pacientes:</b> Organização e acesso a informações clínicas</li>
                <li><b>Comunicação:</b> Suporte técnico, atualizações importantes</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">5.2 Finalidades Secundárias</h3>
              <ul className="list-disc pl-6">
                <li><b>Melhoramento do serviço:</b> Análise de utilização para otimizações</li>
                <li><b>Segurança:</b> Prevenção de fraudes, ataques ou uso indevido</li>
                <li><b>Cumprimento legal:</b> Obrigações fiscais, profissionais e regulamentares</li>
              </ul>
            </section>

            {/* 6. Partilha de Dados */}
            <section id="6" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. PARTILHA DE DADOS</h2>
              <h3 className="text-lg font-semibold mt-6">6.1 Não Partilhamos Dados Pessoais, exceto:</h3>
              <ul className="list-disc pl-6">
                <li><b>Com subcontratantes técnicos:</b>
                  <ul className="list-disc pl-6">
                    <li><b>Supabase</b> (base de dados): Dados armazenados na região eu-west-1 (Irlanda, União Europeia)</li>
                    <li><b>Vercel</b> (hosting): Apenas dados técnicos necessários para funcionamento, servidores na União Europeia quando possível</li>
                    <li><b>Google</b> (autenticação): Apenas para verificação de identidade</li>
                  </ul>
                </li>
                <li><b>Por obrigação legal:</b>
                  <ul className="list-disc pl-6">
                    <li>Autoridades judiciais ou regulamentares, quando legalmente obrigatório</li>
                    <li>Ordem dos Psicólogos, se aplicável e requerido por lei</li>
                  </ul>
                </li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">6.2 Transferências Internacionais</h3>
              <ul className="list-disc pl-6">
                <li><b>Supabase:</b> Dados armazenados na região eu-west-1 (Irlanda, União Europeia)</li>
                <li><b>Google OAuth:</b> Podem ocorrer transferências para EUA com salvaguardas adequadas (Standard Contractual Clauses)</li>
                <li><b>Vercel:</b> Servidores na União Europeia quando possível</li>
                <li><b>Garantias:</b> Utilizamos apenas prestadores com adequadas salvaguardas RGPD</li>
              </ul>
            </section>

            {/* 7. Segurança dos Dados */}
            <section id="7" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. SEGURANÇA DOS DADOS</h2>
              <h3 className="text-lg font-semibold mt-6">7.1 Medidas Técnicas</h3>
              <ul className="list-disc pl-6">
                <li><b>Encriptação:</b> HTTPS obrigatório, dados encriptados na base de dados</li>
                <li><b>Controlo de acesso:</b> Autenticação forte, separação por utilizador</li>
                <li><b>Logs de segurança:</b> Monitorização de acessos suspeitos</li>
                <li><b>Backups seguros:</b> Cópias de segurança encriptadas</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">7.2 Medidas Organizacionais</h3>
              <ul className="list-disc pl-6">
                <li><b>Acesso limitado:</b> Apenas pessoal autorizado acede aos dados</li>
                <li><b>Formação:</b> Equipa formada em proteção de dados</li>
                <li><b>Políticas internas:</b> Procedimentos de segurança documentados</li>
              </ul>
            </section>

            {/* 8. Os Seus Direitos */}
            <section id="8" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. OS SEUS DIREITOS</h2>
              <ul className="list-disc pl-6">
                <li><b>8.1 Direito de Acesso (Art. 15.º RGPD):</b> Pode solicitar uma cópia de todos os seus dados pessoais que processamos.</li>
                <li><b>8.2 Direito de Retificação (Art. 16.º RGPD):</b> Pode corrigir dados incorretos ou incompletos.</li>
                <li><b>8.3 Direito ao Apagamento/&quot;Direito ao Esquecimento&quot; (Art. 17.º RGPD):</b> Pode solicitar a eliminação dos seus dados, sujeito a exceções legais.</li>
                <li><b>8.4 Direito à Limitação do Tratamento (Art. 18.º RGPD):</b> Pode solicitar a suspensão temporária do tratamento.</li>
                <li><b>8.5 Direito à Portabilidade (Art. 20.º RGPD):</b> Pode receber os seus dados em formato estruturado e portável.</li>
                <li><b>8.6 Direito de Oposição (Art. 21.º RGPD):</b> Pode opor-se ao tratamento baseado em interesse legítimo.</li>
                <li><b>8.7 Direito de Retirar Consentimento:</b> Pode retirar consentimentos dados, sem afetar a licitude do tratamento anterior.</li>
                <li><b>8.8 Como Exercer os Seus Direitos:</b><br/>
                  - <b>Email:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a><br/>
                  - <b>Dentro da aplicação:</b> [Funcionalidade a implementar]<br/>
                  - <b>Prazo de resposta:</b> 30 dias (prorrogáveis por mais 60 em casos complexos)
                </li>
              </ul>
            </section>

            {/* 8A. Gestão de Consentimentos */}
            <section id="8A" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8A. GESTÃO DE CONSENTIMENTOS</h2>
              <h3 className="text-lg font-semibold mt-6">8A.1 Tipos de Consentimento</h3>
              <p>O nosso sistema utiliza consentimentos granulares:</p>
              <ul className="list-disc pl-6">
                <li><b>Dados essenciais</b>: Obrigatório para funcionamento básico da aplicação</li>
                <li><b>Dados de saúde</b>: Para tratamento de informações clínicas dos pacientes</li>
                <li><b>Melhorias do serviço</b>: Opcional - análise de utilização para otimizações</li>
                <li><b>Comunicações</b>: Opcional - receber atualizações sobre o serviço</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">8A.2 Como Gerir os Seus Consentimentos</h3>
              <p>Pode consultar e alterar os seus consentimentos a qualquer momento em:<br/>
                <b>Perfil → Proteção de Dados → Gerir Consentimentos</b>
              </p>
              <h3 className="text-lg font-semibold mt-6">8A.3 Retirar Consentimentos</h3>
              <ul className="list-disc pl-6">
                <li><b>Dados essenciais</b>: Não podem ser retirados (implicaria cancelamento da conta)</li>
                <li><b>Outros consentimentos</b>: Podem ser retirados a qualquer momento</li>
                <li><b>Consequências</b>: Explicadas antes de confirmar qualquer retirada</li>
              </ul>
            </section>

            {/* 9. Cookies e Tecnologias Similares */}
            <section id="9" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. COOKIES E TECNOLOGIAS SIMILARES</h2>
              <h3 className="text-lg font-semibold mt-6">9.1 Cookies Utilizados</h3>
              <ul className="list-disc pl-6">
                <li><b>Cookies essenciais:</b>
                  <ul className="list-disc pl-6">
                    <li><code>nextjs-session</code>: Gestão de sessão do utilizador</li>
                    <li><code>supabase-auth-token</code>: Token de autenticação</li>
                  </ul>
                </li>
                <li><b>Cookies funcionais:</b>
                  <ul className="list-disc pl-6">
                    <li><code>user-preferences</code>: Configurações e preferências do utilizador</li>
                  </ul>
                </li>
                <li><b>Não utilizamos:</b> Cookies de marketing, publicidade ou tracking</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">9.2 Gestão de Cookies</h3>
              <p>Pode gerir cookies nas definições do seu navegador. Note que desativar cookies essenciais pode impedir o funcionamento da aplicação.</p>
            </section>

            {/* 10. Retenção de Dados */}
            <section id="10" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">10. RETENÇÃO DE DADOS</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border-b text-left">Tipo de Dados</th>
                      <th className="px-4 py-2 border-b text-left">Prazo de Conservação</th>
                      <th className="px-4 py-2 border-b text-left">Justificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">Dados de conta</td>
                      <td className="px-4 py-2 border-b">Duração da conta + 5 anos</td>
                      <td className="px-4 py-2 border-b">Obrigações contratuais</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Dados clínicos</td>
                      <td className="px-4 py-2 border-b">10 anos após última consulta</td>
                      <td className="px-4 py-2 border-b">Obrigação legal profissional</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Dados financeiros</td>
                      <td className="px-4 py-2 border-b">10 anos</td>
                      <td className="px-4 py-2 border-b">Obrigação fiscal</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Logs de sistema</td>
                      <td className="px-4 py-2 border-b">1 ano</td>
                      <td className="px-4 py-2 border-b">Segurança e auditoria</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">Consentimentos</td>
                      <td className="px-4 py-2 border-b">Duração da conta + 3 anos</td>
                      <td className="px-4 py-2 border-b">Prova de licitude</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="text-lg font-semibold mt-6">10.1 Eliminação Automática</h3>
              <p>Implementamos sistemas para eliminação automática de dados após os prazos estabelecidos.</p>
            </section>

            {/* 11. Menores de Idade */}
            <section id="11" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">11. MENORES DE IDADE</h2>
              <h3 className="text-lg font-semibold mt-6">11.1 Dados de Pacientes Menores</h3>
              <ul className="list-disc pl-6">
                <li><b>Idade mínima:</b> 13 anos (com consentimento dos pais/responsáveis)</li>
                <li><b>Consentimento:</b> Sempre necessário dos pais/responsáveis legais</li>
                <li><b>Proteção especial:</b> Medidas reforçadas de proteção</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">11.2 Utilizadores Menores</h3>
              <ul className="list-disc pl-6">
                <li><b>Psicólogos:</b> Apenas maiores de 18 anos podem criar contas</li>
                <li><b>Estagiários:</b> Com supervisão adequada e autorização</li>
              </ul>
            </section>

            {/* 12. Violações de Dados */}
            <section id="12" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">12. VIOLAÇÕES DE DADOS</h2>
              <h3 className="text-lg font-semibold mt-6">12.1 Procedimentos</h3>
              <ul className="list-disc pl-6">
                <li><b>Notificação CNPD:</b> Em 72 horas</li>
                <li><b>Notificação titulares:</b> Se risco elevado para direitos e liberdades</li>
                <li><b>Medidas corretivas:</b> Implementação imediata de correções</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">12.2 Contacto para Incidentes</h3>
              <ul className="list-disc pl-6">
                <li><b>Email:</b> <a href="mailto:security@myheed.app" className="text-blue-600 hover:underline">security@myheed.app</a></li>
                <li><b>DPO:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
              </ul>
            </section>

            {/* 13. Alterações a esta Política */}
            <section id="13" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">13. ALTERAÇÕES A ESTA POLÍTICA</h2>
              <h3 className="text-lg font-semibold mt-6">13.1 Atualizações</h3>
              <ul className="list-disc pl-6">
                <li><b>Notificação:</b> 30 dias antes de alterações substanciais</li>
                <li><b>Método:</b> Email, notificação na aplicação</li>
                <li><b>Arquivo:</b> Versões anteriores disponíveis a pedido</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">13.2 Aceitação</h3>
              <p>O uso continuado da aplicação após alterações constitui aceitação da nova política.</p>
            </section>

            {/* 14. Contactos e Reclamações */}
            <section id="14" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">14. CONTACTOS E RECLAMAÇÕES</h2>
              <h3 className="text-lg font-semibold mt-6">14.1 Contactos para Exercício de Direitos</h3>
              <ul className="list-disc pl-6">
                <li><b>Email principal:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
                <li><b>Email privacidade:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">14.2 Contactos de Emergência para Questões de Proteção de Dados</h3>
              <ul className="list-disc pl-6">
                <li><b>Violações de dados:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
                <li><b>Exercício de direitos:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
                <li><b>Questões gerais:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
                <li><b>Reclamações:</b> Diretamente à CNPD (contactos abaixo)</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">14.3 Reclamações</h3>
              <div className="bg-gray-50 border-l-4 border-blue-400 p-4 rounded mt-2">
                <b>Autoridade de Controlo - CNPD:</b><br/>
                <b>Website:</b> <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.cnpd.pt</a><br/>
                <b>Email:</b> <a href="mailto:geral@cnpd.pt" className="text-blue-600 hover:underline">geral@cnpd.pt</a><br/>
                <b>Telefone:</b> 213 928 400<br/>
                <b>Morada:</b> Av. D. Carlos I, 134, 1º, 1200-651 Lisboa
              </div>
            </section>

            {/* 15. Informações Legais */}
            <section id="15" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">15. INFORMAÇÕES LEGAIS</h2>
              <h3 className="text-lg font-semibold mt-6">15.1 Legislação Aplicável</h3>
              <ul className="list-disc pl-6">
                <li>Regulamento (UE) 2016/679 (RGPD)</li>
                <li>Lei n.º 58/2019, de 8 de agosto</li>
                <li>Código Deontológico da Ordem dos Psicólogos Portugueses</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">15.2 Jurisdição</h3>
              <p>Tribunais portugueses têm jurisdição exclusiva para resolução de litígios.</p>
            </section>

            {/* Footer */}
            <footer className="pt-8 border-t mt-12 text-sm text-gray-500">
              <div><b>Data de entrada em vigor:</b> 09/07/2025</div>
              <div><b>Versão:</b> 1.0</div>
              <div className="mt-2 italic">Esta Política de Privacidade foi elaborada em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) e a legislação nacional aplicável.</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
} 