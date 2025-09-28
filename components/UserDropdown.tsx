'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuthContext } from '@/app/services/auth-context'

interface UserDropdownProps {
  userData: any
  locale: string
  onOpenAccount?: () => void
}

export default function UserDropdown({ userData, locale, onOpenAccount }: UserDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useAuthContext()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      window.location.href = `/${locale}`
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
        disabled={isLoading}
      >
        <LogOut className="w-4 h-4" />
        <span>
          {isLoading 
            ? (locale === 'zh' ? '登出中...' : 'Logging out...')
            : (locale === 'zh' ? '登出' : 'Logout')
          }
        </span>
      </button>
    </div>
  )
}
