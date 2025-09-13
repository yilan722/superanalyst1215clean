import LanguageSwitcher from './LanguageSwitcher'
import UserInfo from './UserInfo'
import InsightRefineryButton from './InsightRefinery/InsightRefineryButton'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'


// SuperAnalyst Logo Component
function SuperAnalystLogo() {
  return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Magnifying glass circle */}
              <circle cx="9" cy="9" r="7"/>
              
              {/* Magnifying glass handle */}
              <path d="M15 15 L20 20" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-white block">
              SuperAnalyst
            </span>
            <span className="text-sm text-gray-300 block">
              Pro Equity Research
            </span>
          </div>
        </div>
  )
}

interface HeaderProps {
  locale: Locale
  user: any
  onLogout: () => void
  onRefresh: () => void
  onLogin: () => void
  onOpenSubscription: () => void
  onOpenReportHistory: () => void
}

export default function Header({ locale, user, onLogout, onRefresh, onLogin, onOpenSubscription, onOpenReportHistory }: HeaderProps) {

  return (
    <header className="bg-slate-800 shadow-lg border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-4 h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <SuperAnalystLogo />
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            
            {/* Insight Refinery 按钮 - 仅对已登录用户显示 */}
            {user && (
              <InsightRefineryButton
                userId={user.id}
                locale={locale}
                variant="outline"
                size="sm"
                showHistoryOption={true}
                className="text-white border-amber-500/30 hover:bg-amber-500/20"
              />
            )}
            
            {/* 未登录时显示Login按钮 */}
            {!user && (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{getTranslation(locale, 'loginTitle')}</span>
              </button>
            )}
            
            <UserInfo
              user={user}
              onLogout={onLogout}
              onRefresh={onRefresh}
              onLogin={onLogin}
              onOpenSubscription={onOpenSubscription}
              onOpenReportHistory={onOpenReportHistory}
              locale={locale}
              isCompact={true}
            />
          </div>
        </div>
      </div>
    </header>
  )
} 