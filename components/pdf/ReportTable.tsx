'use client'

interface ReportTableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    label: string
    width?: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  title?: string
  striped?: boolean
  compact?: boolean
}

export default function ReportTable({
  data,
  columns,
  title,
  striped = true,
  compact = false
}: ReportTableProps) {
  const getCellValue = (row: any, column: any) => {
    const value = row[column.key]
    if (column.render) {
      return column.render(value, row)
    }
    return value
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-green-400'
    if (percentage >= 80) return 'text-blue-400'
    if (percentage >= 70) return 'text-yellow-400'
    if (percentage >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">Completed</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">Pending</span>
      case 'suspicious':
        return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">Suspicious</span>
      case 'expired':
        return <span className="px-2 py-1 bg-gray-900/30 text-gray-400 rounded text-xs">Expired</span>
      default:
        return <span className="px-2 py-1 bg-gray-900/30 text-gray-400 rounded text-xs">{status}</span>
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className={`w-full ${compact ? 'text-sm' : 'text-base'}`}>
          <thead>
            <tr className="border-b border-border bg-background">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`
                  ${striped && rowIndex % 2 === 0 ? 'bg-background/50' : ''}
                  hover:bg-background/80 transition-colors
                `}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">No data available</h3>
          <p className="mt-1 text-sm text-gray-400">There are no records to display.</p>
        </div>
      )}
      
      {data.length > 0 && (
        <div className="px-6 py-3 border-t border-border bg-background/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Showing <span className="font-medium">{data.length}</span> records
            </div>
            <div>
              Total: <span className="font-medium">{data.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}