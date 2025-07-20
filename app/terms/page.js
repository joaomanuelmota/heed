"use client"
import Link from "next/link";
import Button from "../../components/Button";
import { useEffect } from "react";

const sections = [
  { id: "1", title: "1. Definições e Interpretação" },
  { id: "2", title: "2. Aceitação dos Termos" },
  { id: "3", title: "3. Descrição do Serviço" },
  { id: "4", title: "4. Registo e Conta de Utilizador" },
  { id: "5", title: "5. Uso Aceitável" },
  { id: "6", title: "6. Proteção de Dados e Privacidade" },
  { id: "7", title: "7. Propriedade Intelectual" },
  { id: "8", title: "8. Responsabilidades e Limitações" },
  { id: "9", title: "9. Responsabilidade Profissional" },
  { id: "10", title: "10. Condições Financeiras" },
  { id: "11", title: "11. Backup e Recuperação de Dados" },
  { id: "12", title: "12. Rescisão e Cancelamento" },
  { id: "13", title: "13. Força Maior" },
  { id: "14", title: "14. Disposições Gerais" },
  { id: "15", title: "15. Contactos" },
];

export default function TermsPage() {
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Termos de Serviço - Heed</h1>
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
            {/* 1. Definições e Interpretação */}
            <section id="1" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. DEFINIÇÕES E INTERPRETAÇÃO</h2>
              <h3 className="text-lg font-semibold mt-6">1.1 Definições</h3>
              <ul className="list-disc pl-6">
                <li><b>&quot;Heed&quot;</b> ou <b>&quot;Serviço&quot;</b>: A aplicação web disponível em <a href="https://myheed.app" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://myheed.app</a></li>
                <li><b>&quot;Prestador&quot;</b>: João Mota, responsável pela disponibilização do Serviço</li>
                <li><b>&quot;Utilizador&quot;</b>: Psicólogo ou profissional de saúde mental que utiliza o Serviço</li>
                <li><b>&quot;Paciente&quot;</b>: Pessoa cujos dados são tratados pelo Utilizador através do Serviço</li>
                <li><b>&quot;Conta&quot;</b>: Registo pessoal do Utilizador no Serviço</li>
                <li><b>&quot;Dados&quot;</b>: Todas as informações inseridas, armazenadas ou processadas através do Serviço</li>
              </ul>
            </section>

            {/* 2. Aceitação dos Termos */}
            <section id="2" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. ACEITAÇÃO DOS TERMOS</h2>
              <h3 className="text-lg font-semibold mt-6">2.1 Concordância</h3>
              <p>Ao utilizar o Heed, o Utilizador declara:</p>
              <ul className="list-disc pl-6">
                <li>Ter lido e compreendido estes Termos de Serviço</li>
                <li>Aceitar integralmente as condições aqui estabelecidas</li>
                <li>Ter capacidade legal para celebrar este acordo</li>
                <li>Ser profissional qualificado em psicologia ou saúde mental</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">2.2 Alterações</h3>
              <p>O Prestador pode alterar estes termos a qualquer momento, notificando os Utilizadores com 30 dias de antecedência através de email ou notificação na aplicação.</p>
            </section>

            {/* 3. Descrição do Serviço */}
            <section id="3" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. DESCRIÇÃO DO SERVIÇO</h2>
              <h3 className="text-lg font-semibold mt-6">3.1 Funcionalidades</h3>
              <ul className="list-disc pl-6">
                <li>Gestão de informações de pacientes</li>
                <li>Registo de sessões terapêuticas</li>
                <li>Criação e gestão de planos de tratamento</li>
                <li>Controlo financeiro e faturação</li>
                <li>Agenda e calendário de consultas</li>
                <li>Armazenamento seguro de notas clínicas</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">3.2 Disponibilidade</h3>
              <ul className="list-disc pl-6">
                <li>O Serviço está disponível 24/7, sujeito a manutenções programadas</li>
                <li>Manutenções serão comunicadas com antecedência mínima de 24 horas</li>
                <li>O Prestador não garante disponibilidade de 100% sem interrupções</li>
              </ul>
            </section>

            {/* 4. Registo e Conta de Utilizador */}
            <section id="4" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. REGISTO E CONTA DE UTILIZADOR</h2>
              <h3 className="text-lg font-semibold mt-6">4.1 Elegibilidade</h3>
              <ul className="list-disc pl-6">
                <li>Ser maior de 18 anos</li>
                <li>Ser psicólogo ou profissional de saúde mental qualificado</li>
                <li>Possuir título profissional válido e reconhecido</li>
                <li>Cumprir regulamentação profissional aplicável</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">4.2 Informações de Registo</h3>
              <ul className="list-disc pl-6">
                <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
                <li>Manter a confidencialidade das credenciais de acesso</li>
                <li>Notificar imediatamente qualquer uso não autorizado da conta</li>
                <li>Ser responsável por todas as atividades realizadas na sua conta</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">4.3 Suspensão de Conta</h3>
              <ul className="list-disc pl-6">
                <li>Violação destes Termos de Serviço</li>
                <li>Uso inadequado ou abusivo do Serviço</li>
                <li>Informações falsas ou enganosas no registo</li>
                <li>Atividades ilegais ou não éticas</li>
              </ul>
            </section>

            {/* 5. Uso Aceitável */}
            <section id="5" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. USO ACEITÁVEL</h2>
              <h3 className="text-lg font-semibold mt-6">5.1 Obrigações do Utilizador</h3>
              <ul className="list-disc pl-6">
                <li>Utilizar o Serviço apenas para fins profissionais legítimos</li>
                <li>Cumprir todas as leis e regulamentos aplicáveis</li>
                <li>Respeitar o Código Deontológico da sua profissão</li>
                <li>Proteger a confidencialidade dos dados dos pacientes</li>
                <li>Não partilhar credenciais de acesso com terceiros</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">5.2 Utilizações Proibidas</h3>
              <ul className="list-disc pl-6">
                <li>Usar o Serviço para fins ilegais ou não autorizados</li>
                <li>Tentar aceder a contas de outros utilizadores</li>
                <li>Interferir com o funcionamento do Serviço</li>
                <li>Introduzir vírus, malware ou código malicioso</li>
                <li>Fazer engenharia reversa ou tentar extrair código fonte</li>
                <li>Usar o Serviço para spam ou comunicações indesejadas</li>
              </ul>
            </section>

            {/* 6. Proteção de Dados e Privacidade */}
            <section id="6" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. PROTEÇÃO DE DADOS E PRIVACIDADE</h2>
              <h3 className="text-lg font-semibold mt-6">6.1 Dados dos Pacientes</h3>
              <ul className="list-disc pl-6">
                <li>Obter consentimento adequado dos pacientes para tratamento de dados</li>
                <li>Garantir que tem base legal para inserir dados no Serviço</li>
                <li>Informar os pacientes sobre o uso do Serviço</li>
                <li>Cumprir obrigações do RGPD na qualidade de responsável pelo tratamento</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">6.2 Processamento de Dados</h3>
              <ul className="list-disc pl-6">
                <li>Processa dados apenas sob instruções do Utilizador</li>
                <li>Implementa medidas de segurança adequadas</li>
                <li>Não acede a dados dos pacientes salvo para fins técnicos necessários</li>
                <li>Elimina dados quando solicitado pelo Utilizador</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">6.3 Política de Privacidade</h3>
              <p>O tratamento de dados rege-se pela Política de Privacidade disponível em <a href="https://myheed.app/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://myheed.app/privacy</a>.</p>
            </section>

            {/* 7. Propriedade Intelectual */}
            <section id="7" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. PROPRIEDADE INTELECTUAL</h2>
              <h3 className="text-lg font-semibold mt-6">7.1 Propriedade do Serviço</h3>
              <ul className="list-disc pl-6">
                <li>O Heed, incluindo código, design e funcionalidades, é propriedade do Prestador</li>
                <li>O Utilizador obtém apenas licença de uso, não propriedade</li>
                <li>Marca &quot;Heed&quot; e logótipos são propriedade exclusiva do Prestador</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">7.2 Dados do Utilizador</h3>
              <ul className="list-disc pl-6">
                <li>O Utilizador mantém propriedade sobre os dados que insere</li>
                <li>O Prestador não reivindica direitos sobre conteúdo clínico</li>
                <li>Dados podem ser exportados a qualquer momento pelo Utilizador</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">7.3 Feedback</h3>
              <p>Sugestões ou feedback fornecidos pelo Utilizador podem ser utilizados pelo Prestador para melhorar o Serviço sem compensação.</p>
            </section>

            {/* 8. Responsabilidades e Limitações */}
            <section id="8" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. RESPONSABILIDADES E LIMITAÇÕES</h2>
              <h3 className="text-lg font-semibold mt-6">8.1 Responsabilidades do Prestador</h3>
              <ul className="list-disc pl-6">
                <li>Manter medidas de segurança adequadas</li>
                <li>Fornecer suporte técnico razoável</li>
                <li>Cumprir obrigações de proteção de dados</li>
                <li>Notificar violações de dados conforme legalmente exigido</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">8.2 Limitações de Responsabilidade</h3>
              <ul className="list-disc pl-6">
                <li>Decisões clínicas tomadas com base em dados no Serviço</li>
                <li>Perda de dados devido a ações do Utilizador</li>
                <li>Interrupções de serviço fora do controlo do Prestador</li>
                <li>Danos indiretos, especiais ou consequenciais</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">8.3 Exclusão de Garantias</h3>
              <ul className="list-disc pl-6">
                <li>Funcionamento ininterrupto</li>
                <li>Ausência de erros</li>
                <li>Adequação a fins específicos</li>
                <li>Compatibilidade com todos os sistemas</li>
              </ul>
            </section>

            {/* 9. Responsabilidade Profissional */}
            <section id="9" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. RESPONSABILIDADE PROFISSIONAL</h2>
              <h3 className="text-lg font-semibold mt-6">9.1 Autonomia Profissional</h3>
              <ul className="list-disc pl-6">
                <li>O Heed é uma ferramenta de apoio, não substitui julgamento profissional</li>
                <li>O Utilizador mantém total responsabilidade por decisões clínicas</li>
                <li>O Prestador não fornece aconselhamento médico ou psicológico</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">9.2 Conformidade Regulamentar</h3>
              <ul className="list-disc pl-6">
                <li>Cumprir regulamentação da Ordem dos Psicólogos</li>
                <li>Manter seguros de responsabilidade civil adequados</li>
                <li>Seguir normas éticas da sua profissão</li>
                <li>Garantir qualificações profissionais válidas</li>
              </ul>
            </section>

            {/* 10. Condições Financeiras */}
            <section id="10" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">10. CONDIÇÕES FINANCEIRAS</h2>
              <h3 className="text-lg font-semibold mt-6">10.1 Modelo de Preços</h3>
              <ul className="list-disc pl-6">
                <li>[A definir - gratuito/freemium/subscrição]</li>
                <li>Preços podem ser alterados com notificação de 60 dias</li>
                <li>Pagamentos processados através de prestadores terceiros seguros</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">10.2 Reembolsos</h3>
              <ul className="list-disc pl-6">
                <li>Política de reembolsos será definida separadamente</li>
                <li>Cancelamentos devem ser comunicados com antecedência</li>
                <li>Dados podem ser exportados antes do cancelamento</li>
              </ul>
            </section>

            {/* 11. Backup e Recuperação de Dados */}
            <section id="11" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">11. BACKUP E RECUPERAÇÃO DE DADOS</h2>
              <h3 className="text-lg font-semibold mt-6">11.1 Backups</h3>
              <ul className="list-disc pl-6">
                <li>O Prestador realiza backups regulares dos dados</li>
                <li>Backups não substituem responsabilidade do Utilizador</li>
                <li>Recuperação de dados pode estar sujeita a limitações técnicas</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">11.2 Exportação de Dados</h3>
              <ul className="list-disc pl-6">
                <li>Utilizador pode exportar dados a qualquer momento</li>
                <li>Formatos de exportação: JSON, CSV conforme aplicável</li>
                <li>Dados exportados mantêm-se propriedade do Utilizador</li>
              </ul>
            </section>

            {/* 12. Rescisão e Cancelamento */}
            <section id="12" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">12. RESCISÃO E CANCELAMENTO</h2>
              <h3 className="text-lg font-semibold mt-6">12.1 Rescisão pelo Utilizador</h3>
              <ul className="list-disc pl-6">
                <li>Conta pode ser cancelada a qualquer momento</li>
                <li>Dados serão eliminados conforme Política de Privacidade</li>
                <li>Exportação de dados deve ser feita antes do cancelamento</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">12.2 Rescisão pelo Prestador</h3>
              <p>Motivos para rescisão:</p>
              <ul className="list-disc pl-6">
                <li>Violação destes Termos de Serviço</li>
                <li>Uso inadequado ou abusivo</li>
                <li>Não pagamento (se aplicável)</li>
                <li>Descontinuação do Serviço</li>
              </ul>
              <h3 className="text-lg font-semibold mt-6">12.3 Efeitos da Rescisão</h3>
              <ul className="list-disc pl-6">
                <li>Acesso ao Serviço é imediatamente terminado</li>
                <li>Dados são eliminados conforme prazos legais</li>
                <li>Obrigações de confidencialidade mantêm-se</li>
              </ul>
            </section>

            {/* 13. Força Maior */}
            <section id="13" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">13. FORÇA MAIOR</h2>
              <p>O Prestador não é responsável por incumprimentos devido a circunstâncias fora do seu controlo, incluindo:</p>
              <ul className="list-disc pl-6">
                <li>Desastres naturais</li>
                <li>Falhas de infraestrutura de internet</li>
                <li>Ações governamentais</li>
                <li>Greves ou conflitos laborais</li>
                <li>Pandemias ou emergências de saúde pública</li>
              </ul>
            </section>

            {/* 14. Disposições Gerais */}
            <section id="14" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">14. DISPOSIÇÕES GERAIS</h2>
              <h3 className="text-lg font-semibold mt-6">14.1 Lei Aplicável</h3>
              <p>Estes Termos regem-se pela lei portuguesa e são interpretados de acordo com a mesma.</p>
              <h3 className="text-lg font-semibold mt-6">14.2 Jurisdição</h3>
              <p>Eventuais litígios serão da competência exclusiva dos tribunais portugueses.</p>
              <h3 className="text-lg font-semibold mt-6">14.3 Integralidade</h3>
              <p>Estes Termos constituem o acordo integral entre as partes, substituindo acordos anteriores.</p>
              <h3 className="text-lg font-semibold mt-6">14.4 Divisibilidade</h3>
              <p>Se alguma disposição for considerada inválida, as restantes mantêm-se em vigor.</p>
              <h3 className="text-lg font-semibold mt-6">14.5 Renúncia</h3>
              <p>A não exigência de cumprimento de qualquer disposição não constitui renúncia.</p>
            </section>

            {/* 15. Contactos */}
            <section id="15" className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">15. CONTACTOS</h2>
              <p>Para qualquer questão relacionada com estes Termos de Serviço, suporte técnico ou privacidade, contacte:</p>
              <ul className="list-disc pl-6">
                <li><b>Email:</b> <a href="mailto:joao@myheed.app" className="text-blue-600 hover:underline">joao@myheed.app</a></li>
              </ul>
            </section>

            {/* Footer */}
            <footer className="pt-8 border-t mt-12 text-sm text-gray-500">
              <div><b>Data de entrada em vigor:</b> 09/07/2025</div>
              <div><b>Versão:</b> 1.0</div>
              <div className="mt-2 italic">Estes Termos de Serviço foram elaborados em conformidade com a legislação portuguesa e regulamentação aplicável a serviços digitais e tratamento de dados pessoais.</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
} 