'use client'
import Link from 'next/link'
import { Calendar, Users, CreditCard, BarChart3, Shield, Clock, CheckCircle, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Heed</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/signup" 
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gestão Simplificada para
            <span className="text-black block">Psicólogos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Organize pacientes, sessões e pagamentos numa única plataforma. 
            Foque-se no que realmente importa: ajudar os seus pacientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup" 
              className="bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Começar Agora - Grátis
            </Link>
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-black transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sem cartão de crédito • Setup em 2 minutos • Suporte gratuito
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo o que precisa num só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elimine a confusão de múltiplas ferramentas. Heed é a solução completa para psicólogos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestão de Pacientes</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize informações dos pacientes, histórico clínico e notas de sessão de forma segura e acessível.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Agendamento Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Calendário integrado com lembretes automáticos e gestão de horários de forma intuitiva.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Controlo Financeiro</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe pagamentos, emita faturas e mantenha o controlo financeiro da sua prática.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Relatórios Detalhados</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize o progresso dos pacientes e analise o desempenho da sua prática com relatórios claros.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Segurança Total</h3>
              <p className="text-gray-600 leading-relaxed">
                Dados protegidos com encriptação de nível bancário e conformidade com RGPD.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Poupe Tempo</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatize tarefas repetitivas e foque-se no que realmente importa: os seus pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher Heed?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desenvolvido especificamente para psicólogos, por psicólogos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interface Intuitiva</h3>
                    <p className="text-gray-600">Design limpo e fácil de usar, sem necessidade de formação complexa.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso em Qualquer Lugar</h3>
                    <p className="text-gray-600">Funciona em desktop, tablet e telemóvel. Aceda aos seus dados quando e onde precisar.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte Personalizado</h3>
                    <p className="text-gray-600">Equipa de suporte dedicada para ajudar com qualquer questão ou dúvida.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Atualizações Regulares</h3>
                    <p className="text-gray-600">Novas funcionalidades e melhorias constantes, sem custos adicionais.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Comece Hoje Mesmo</h3>
                <p className="text-gray-600 mb-6">
                  Junte-se a centenas de psicólogos que já confiam no Heed para gerir as suas práticas.
                </p>
                <Link 
                  href="/signup" 
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors block"
                >
                  Criar Conta Grátis
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Teste gratuito de 14 dias • Sem compromisso
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar a sua prática?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se aos psicólogos que já poupam horas por semana com o Heed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Começar Agora
            </Link>
            <Link 
              href="/login" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-colors"
            >
              Entrar na Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold">Heed</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Heed. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}