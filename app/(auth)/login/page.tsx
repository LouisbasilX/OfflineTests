'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      router.push('/editor')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@offlinetests.com',
        password: 'demopassword123',
      })
      
      if (error) throw error
      router.push('/editor')
    } catch {
      setError('Demo login failed. Try credentials: demo@offlinetests.com / demopassword123')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">OfflineTests</h1>
          <p className="text-gray-400">Secure exam platform for educators</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Teacher Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="teacher@school.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full border border-border py-3 rounded-lg hover:bg-surface/50 disabled:opacity-50 transition-colors"
            >
              Try Demo Account
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-accent hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              All test data is encrypted client-side. We never see your exam content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}