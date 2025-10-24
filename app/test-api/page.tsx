'use client'

import { apiClient } from '@/lib/api'
import { useState } from 'react'

export default function TestApiPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testEndpoints = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test health
      console.log('Testing health...')
      const health = await apiClient.checkHealth()
      testResults.health = health

      // Test workshops
      console.log('Testing workshops...')
      const workshops = await apiClient.getWorkshops()
      testResults.workshops = workshops

      // Test services
      console.log('Testing services...')
      const services = await apiClient.getServices()
      testResults.services = services

      // Test customers
      console.log('Testing customers...')
      const customers = await apiClient.getUsers('customer')
      testResults.customers = customers

      // Test bookings
      console.log('Testing bookings...')
      const bookings = await apiClient.getBookings()
      testResults.bookings = bookings

    } catch (error) {
      console.error('Error testing API:', error)
      testResults.error = error
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste da API MECA</h1>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="bg-[#00c977] text-white px-4 py-2 rounded-lg hover:bg-[#00b369] disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Endpoints'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Resultados dos Testes:</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

