'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ActivityLog {
  id: string
  action: string
  timestamp: string
  details: string
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  const fetchActivityLogs = async () => {
    try {
      // In production, you'd have an activity_logs table
      // This is a mock implementation
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          action: 'TEST_CREATED',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Test ABC123 created by Teacher 1'
        },
        {
          id: '2',
          action: 'SUBMISSION_RECEIVED',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: 'Submission for test XYZ789 received'
        },
        {
          id: '3',
          action: 'DATA_CLEANUP',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          details: 'Expired tests and submissions cleaned'
        },
        {
          id: '4',
          action: 'SYSTEM_BACKUP',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'Daily backup completed'
        }
      ]
      
      setLogs(mockLogs)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'TEST_CREATED': return 'bg-blue-900/30 text-blue-400'
      case 'SUBMISSION_RECEIVED': return 'bg-green-900/30 text-green-400'
      case 'DATA_CLEANUP': return 'bg-yellow-900/30 text-yellow-400'
      case 'SYSTEM_BACKUP': return 'bg-purple-900/30 text-purple-400'
      default: return 'bg-gray-900/30 text-gray-400'
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-background rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="bg-background border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{log.details}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={fetchActivityLogs}
            className="text-accent hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}