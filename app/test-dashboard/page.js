'use client'
import Sidebar from '../../components/Sidebar'

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">Test Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Testing Sidebar Design</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Test Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sidebar Test</h3>
              <p className="text-gray-600">Esta é uma página de teste para verificar o design da sidebar.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
              <p className="text-gray-600">Testa os links da sidebar para verificar se funcionam.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Layout</h3>
              <p className="text-gray-600">Verifica se o layout fica bem organizado.</p>
            </div>
          </div>

          {/* More Test Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Checklist</h3>
            <div className="space-y-2">
              <p className="text-gray-600">✅ Sidebar com cor #fafafa</p>
              <p className="text-gray-600">✅ Logo no topo</p>
              <p className="text-gray-600">✅ Menus no meio</p>
              <p className="text-gray-600">✅ Profile + Logout no fundo</p>
              <p className="text-gray-600">✅ Ocupa toda a altura da tela</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}