import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Heed
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Psychology Practice Management
        </p>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium inline-block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}