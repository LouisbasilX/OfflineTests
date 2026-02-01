'use client'

import { useState, useEffect } from 'react'

interface ServerLoadProps {
  refreshInterval?: number
}

export default function ServerLoad({ refreshInterval = 10000 }: ServerLoadProps) {
  const [cpuLoad, setCpuLoad] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [activeConnections, setActiveConnections] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const updateMetrics = () => {
      // Mock metrics - in production, fetch from your monitoring system
      setCpuLoad(Math.random() * 100)
      setMemoryUsage(30 + Math.random() * 50)
      setActiveConnections(Math.floor(Math.random() * 1000))
      setLastUpdated(new Date())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const getCpuColor = (load: number) => {
    if (load < 50) return 'text-green-400'
    if (load < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getMemoryColor = (usage: number) => {
    if (usage < 60) return 'text-green-400'
    if (usage < 85) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConnectionColor = (connections: number) => {
    if (connections < 300) return 'text-green-400'
    if (connections < 700) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Server Load</h3>
      
      <div className="space-y-6">
        {/* CPU Load */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">CPU Load</span>
            <span className={`font-mono font-bold ${getCpuColor(cpuLoad)}`}>
              {cpuLoad.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                cpuLoad < 50 ? 'bg-green-500' : 
                cpuLoad < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(cpuLoad, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Memory Usage</span>
            <span className={`font-mono font-bold ${getMemoryColor(memoryUsage)}`}>
              {memoryUsage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                memoryUsage < 60 ? 'bg-green-500' : 
                memoryUsage < 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(memoryUsage, 100)}%` }}
            />
          </div>
        </div>

        {/* Active Connections */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Active Connections</span>
            <span className={`font-mono font-bold ${getConnectionColor(activeConnections)}`}>
              {activeConnections}
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                activeConnections < 300 ? 'bg-green-500' : 
                activeConnections < 700 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((activeConnections / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${getCpuColor(cpuLoad)}`}>
                {cpuLoad < 80 ? '✓' : '⚠'}
              </div>
              <div className="text-xs text-gray-400 mt-1">CPU</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${getMemoryColor(memoryUsage)}`}>
                {memoryUsage < 85 ? '✓' : '⚠'}
              </div>
              <div className="text-xs text-gray-400 mt-1">Memory</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${getConnectionColor(activeConnections)}`}>
                {activeConnections < 700 ? '✓' : '⚠'}
              </div>
              <div className="text-xs text-gray-400 mt-1">Connections</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span>Refresh: {(refreshInterval / 1000)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}