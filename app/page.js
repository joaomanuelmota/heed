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
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              Launching new features
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-gray-900 mb-6 leading-tight text-center">
            Prática clínica simplificada<br/>
            <span className="">para psicólogos</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Simplifique a sua rotina com agendamento, prontuários, finanças e progresso clínico — tudo num só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup" className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Experimente Grátis
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything your business needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive fintech solutions to streamline your financial operations and drive growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Automation</h3>
              <p className="text-gray-600">Automate payment processing and reconciliation to reduce manual errors and improve efficiency.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Monitor financial performance with real-time dashboards and comprehensive reporting.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">Advanced fraud detection and risk assessment tools to protect your business.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Tools</h3>
              <p className="text-gray-600">Built-in compliance features to meet regulatory requirements effortlessly.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-currency Support</h3>
              <p className="text-gray-600">Process payments in multiple currencies with real-time exchange rates.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-indigo-600 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">API Integration</h3>
              <p className="text-gray-600">Powerful APIs for seamless integration with your existing financial systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by finance teams worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how our platform transforms financial operations for businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-4">
                  <span>★★★★★</span>
                </div>
                <p className="text-lg text-gray-700 italic mb-6">
                  "Our payment processing efficiency increased by 40% and transaction failures dropped to near zero. The automation features are game-changing."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">CFO at TechCorp</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-4">
                  <span>★★★★★</span>
                </div>
                <p className="text-lg text-gray-700 italic mb-6">
                  "The real-time analytics and fraud detection capabilities have saved us millions. We can spot issues before they become problems."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Head of Risk at FinanceFlow</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-4">
                  <span>★★★★★</span>
                </div>
                <p className="text-lg text-gray-700 italic mb-6">
                  "Compliance used to be a nightmare. Now our regulatory reporting is automated and we're always audit-ready."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Leila Rodriguez</h4>
                  <p className="text-sm text-gray-600">Operations Director at GlobalPay</p>
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
              Transparent pricing for every stage
            </h2>
            <p className="text-xl text-gray-600">
              Scale your financial operations with plans that grow with your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">Free</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for small businesses starting their fintech journey</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Up to 100 transactions/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Basic payment processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Standard reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Get Started
              </button>
            </div>

            <div className="p-6 rounded-xl border-2 border-blue-500 bg-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Ideal for growing businesses with higher transaction volumes</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Up to 10,000 transactions/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Advanced payment processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Real-time analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Multi-currency support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              
              <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                Start 14-day trial
              </button>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-gray-600 mb-6">For large organizations with complex financial operations</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Unlimited transactions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Custom payment workflows</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Advanced compliance tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">24/7 premium support</span>
                </li>
              </ul>
              
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Have questions? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-700 px-6 pt-16 pb-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center">
                  <div className="h-4 w-4 rounded-sm bg-white"></div>
                </div>
                <span className="text-xl font-bold text-black">Heed</span>
              </div>
              <p className="text-gray-500 mb-6">
                Gestão moderna de tarefas e pacientes para equipas que valorizam clareza, foco e resultados.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.32 0-.63-.02-.94-.06A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22.46 6z"/></svg></a>
                <a href="#" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><span className="sr-only">LinkedIn</span><svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/></svg></a>
                <a href="#" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><span className="sr-only">Facebook</span><svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .732.592 1.324 1.325 1.324h11.495v-9.294h-3.124v-3.622h3.124v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.592 1.323-1.324v-21.35c0-.733-.593-1.325-1.326-1.325z"/></svg></a>
                <a href="#" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><span className="sr-only">YouTube</span><svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112c-1.863-.504-9.386-.504-9.386-.504s-7.523 0-9.386.504a2.994 2.994 0 0 0-2.112 2.112c-.504 1.863-.504 5.754-.504 5.754s0 3.891.504 5.754a2.994 2.994 0 0 0 2.112 2.112c1.863.504 9.386.504 9.386.504s7.523 0 9.386-.504a2.994 2.994 0 0 0 2.112-2.112c.504-1.863.504-5.754.504-5.754s0-3.891-.504-5.754zm-13.498 9.568v-7.508l6.545 3.754-6.545 3.754z"/></svg></a>
              </div>
            </div>
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-500 hover:text-black transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Integrações</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-black transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Atualizações</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Roadmap</a></li>
              </ul>
            </div>
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Imprensa</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Contacto</a></li>
              </ul>
            </div>
            {/* Resources Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Recursos</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Ajuda</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Guias & Tutoriais</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">API</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Heed. Todos os direitos reservados.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-500 hover:text-black text-sm transition-colors">Política de Privacidade</Link>
              <Link href="/terms" className="text-gray-500 hover:text-black text-sm transition-colors">Termos e Condições</Link>
              <a href="#" className="text-gray-500 hover:text-black text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}