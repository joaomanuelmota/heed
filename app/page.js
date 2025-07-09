export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-white"></div>
            </div>
            <span className="text-xl font-bold">Your Logo</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 px-4 py-2">
              Log in
            </button>
            <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Get Started
            </button>
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
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Financial operations for 
            <span className="text-blue-600"> growth</span> businesses
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your financial workflows with our comprehensive fintech platform. 
            Built for modern businesses who value efficiency, compliance, and scalable growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Start for free
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Book a demo
            </button>
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
      <footer className="bg-gray-900 text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center">
                  <div className="h-4 w-4 rounded-sm bg-gray-900"></div>
                </div>
                <span className="text-xl font-bold">Your Logo</span>
              </div>
              <p className="text-gray-400 mb-6">
                Modern financial operations platform for growth businesses who value efficiency and scalability.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Your Company. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}