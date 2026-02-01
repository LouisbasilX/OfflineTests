'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

export default function Sidebar({ items, user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`bg-surface border-r border-border h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="font-bold">OT</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">OfflineTests</h2>
                <p className="text-xs text-gray-400">Secure Exams</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mx-auto">
              <span className="font-bold">OT</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {user && !collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="font-bold">{user.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-accent/10 text-accent border border-accent/30' 
                      : 'text-gray-400 hover:bg-background hover:text-white'
                    }
                  `}
                >
                  <span className={`${isActive ? 'text-accent' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="text-xs text-gray-400">
              <p>All data encrypted</p>
              <p>Automatic cleanup</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="text-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  )
}