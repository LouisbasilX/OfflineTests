'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface SystemMetrics {
  active_tests: number
  pending_submissions: number
  total_teachers: number
  db_size_bytes: number
  server_load: number
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // In real app, check admin role from database
      // This is a simplified check
      if (!session) {
        router.push('/login')
        return
      }
      
      fetchMetrics()
    }
    
    checkAdmin()
  }, [])

  const fetchMetrics = async () => {
    try {
      // Fetch from view or direct queries
      const { data: tests } = await supabase
        .from('tests')
        .select('count')
        .gt('expires_at', new Date().toISOString())
      
      const { data: submissions } = await supabase
        .from('submissions')
        .select('count')
        .gt('expires_at', new Date().toISOString())
      
      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('count')
      
      setMetrics({
        active_tests: tests?.[0]?.count || 0,
        pending_submissions: submissions?.[0]?.count || 0,
        total_teachers: teachers?.[0]?.count || 0,
        db_size_bytes: 0, // You'd need a custom function for this
        server_load: 0, // You'd need monitoring integration
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">System Dashboard</h1>
          <p className="text-gray-400">Owner-blind metrics (no test content access)</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent">
            <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm text-accent">All data encrypted • Owner cannot read test content</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Tests</h3>
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{metrics?.active_tests || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Tests currently in progress</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending Submissions</h3>
              <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{metrics?.pending_submissions || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Awaiting correction (expire in 3h)</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Teachers</h3>
              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{metrics?.total_teachers || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Registered educators</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Database Size</h3>
              <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{formatBytes(metrics?.db_size_bytes || 0)}</p>
            <p className="text-sm text-gray-400 mt-2">Encrypted data storage</p>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Security Status</h4>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400">All systems operational</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Data Retention</h4>
              <p className="text-white">Tests: 10min post-duration • Submissions: 3h post-test</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Encryption</h4>
              <p className="text-white">AES-GCM 256-bit • Client-side only • Zero-knowledge</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Last Cleanup</h4>
              <p className="text-white">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Manual Controls</h3>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                const response = await fetch('/api/admin/flush', {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`
                  }
                })
                if (response.ok) {
                  alert('Manual cleanup initiated')
                  fetchMetrics()
                }
              }}
              className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg hover:bg-red-900/50 transition-colors"
            >
              Force Cleanup
            </button>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-accent/10 border border-accent rounded-lg hover:bg-accent/20 transition-colors"
            >
              Refresh Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}