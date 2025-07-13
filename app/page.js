'use client'
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b border-gray-200 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-white"></div>
            </div>
            <span className="text-xl font-bold text-black">Heed</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2">
              Log in
            </Link>
            <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Experimente Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-6 leading-tight text-center">
            Prática clínica simplificada<br/>
            <span className="">para psicólogos</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descomplica a gestão da tua prática clínica do primeiro paciente à agenda completa.<br/>
            Pacientes, agendamentos, prontuários, finanças, tudo num só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup" className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Experimente Grátis
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            30 dias gratuitos sem compromisso
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades pensadas para psicólogos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gere pacientes, sessões e finanças de forma simples e eficiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                {/* UserGroupIcon */}
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão De Pacientes</h3>
              <p className="text-gray-600">Centraliza e organiza todas as informações dos teus pacientes num só lugar.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparação De Sessões</h3>
              <p className="text-gray-600">Cria planos tratamento personalizados e mantém um registo completo na área de cada paciente.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Registo De Sessões</h3>
              <p className="text-gray-600">Cria registos completos durante ou após a sessão e consulta o histórico de cada paciente sem esforço.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                {/* CalendarDaysIcon */}
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8.5V7a2 2 0 012-2h14a2 2 0 012 2v1.5M3 8.5V17a2 2 0 002 2h14a2 2 0 002-2V8.5M3 8.5h18M7 11h.01M7 15h.01M12 11h.01M12 15h.01M17 11h.01M17 15h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Agenda E Calendário</h3>
              <p className="text-gray-600">Consulta a tua agenda por dia, semana ou mês e vê exactamente as consultas que tens marcadas.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Controlo De Pagamentos</h3>
              <p className="text-gray-600">Vê rapidamente os pagamentos em atraso e as faturas por emitir para manter as tuas finanças sempre organizadas.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Financeiro</h3>
              <p className="text-gray-600">Visualiza a tua faturação mensal e anual, compara o crescimento mês a mês e controla a saúde financeira do teu negócio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que dizem os psicólogos que usam
            </h2>
            <p className="text-xl text-gray-600">
              Descubra como psicólogos estão a usar a Heed para simplificar e organizar a sua prática clínica.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <p className="text-lg text-gray-700 italic mb-6">
                  &quot;Com a Heed, tenho todos os dados do paciente, notas e preparação de sessões num só lugar. É incrível ter essa visão completa e organizada.&quot;
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Inês Rocha</h4>
                  <p className="text-sm text-gray-600">Psicóloga Clínica, Braga</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <p className="text-lg text-gray-700 italic mb-6">
                  &quot;Agora tenho todas as sessões organizadas por dia, semana e mês, o que tornou a gestão da minha agenda muito mais fácil.&quot;
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Carla Mendes</h4>
                  <p className="text-sm text-gray-600">Psicóloga Cognitivo-comportamental, Porto</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <p className="text-lg text-gray-700 italic mb-6">
                  &quot;Fazer o tracking dos pagamentos e faturas é super simples na Heed. Saber quanto já faturei, o que está em atraso e o que posso faturar com sessões agendadas dá-me muita tranquilidade e controlo no meu negócio.&quot;
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Tiago Moreira</h4>
                  <p className="text-sm text-gray-600">Psicólogo Clínico, Coimbra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Começa Grátis
            </h2>
            <p className="text-xl text-gray-600">
              Experimenta um software pensado para psicólogos independentes.<br/>
              Sem necessidade de cartão de crédito. Cancela quando quiseres.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="p-6 rounded-xl border-2 border-blue-500 bg-white relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Tudo Incluído
                  </span>
                </div>
                
                <div className="mb-1">
                  <span className="text-4xl font-bold text-gray-900">€5,81</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-gray-600 mb-6">Pensado para acompanhar-te desde o primeiro paciente até à agenda cheia.</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Gestão de pacientes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Preparação de sessões</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Registo de sessões</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Controlo de pagamentos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Dashboard de faturação</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Agenda semanal/mensal</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Calendário terapêutico</span>
                  </li>
                </ul>
                
                <Link href="/signup" className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-center block">
                  Experimenta Grátis
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-700 px-6 pt-16 pb-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-white"></div>
            </div>
            <span className="text-xl font-bold text-black">Heed</span>
          </div>
          
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/terms" className="text-gray-500 hover:text-black text-sm transition-colors">Termos e Condições</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-black text-sm transition-colors">Política de Privacidade</Link>
          </div>
          
          <p className="text-gray-400 text-sm">© 2025 Heed. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}