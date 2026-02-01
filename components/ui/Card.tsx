import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({ 
  children, 
  className = '',
  padding = 'md',
  hover = false 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={`
      bg-surface border border-border rounded-xl 
      ${paddingClasses[padding]} 
      ${hover ? 'hover:border-accent/50 transition-colors' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}