'use client'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  description?: string
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  description 
}: MetricsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-900/30 border-blue-700 text-blue-400',
    green: 'bg-green-900/30 border-green-700 text-green-400',
    red: 'bg-red-900/30 border-red-700 text-red-400',
    yellow: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    purple: 'bg-purple-900/30 border-purple-700 text-purple-400',
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className={`w-10 h-10 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold">{value}</p>
        {change !== undefined && (
          <div className="flex items-center mt-1">
            <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-400 ml-2">from last week</span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-400 mt-2">{description}</p>
      )}
    </div>
  )
}