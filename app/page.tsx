import Link from 'next/link'
import { FileText, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            SmartHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-Powered Regulation Library Management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/regulation-review"
            className="group block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Review Regulations
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Review and confirm Claude-generated regulation libraries
            </p>
          </Link>

          <div className="group block p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-75">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Manage Library
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Coming soon: Manage your confirmed regulation libraries
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
