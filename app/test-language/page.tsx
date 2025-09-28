'use client'

import { useState } from 'react'
import { type Locale } from '../services/i18n'
import LanguageSelector from '../../components/LanguageSelector'

export default function TestLanguagePage() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en')

  const handleLocaleChange = (newLocale: Locale) => {
    setCurrentLocale(newLocale)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Language Switching Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Language Selector</h2>
          <LanguageSelector 
            currentLocale={currentLocale} 
            onLocaleChange={handleLocaleChange} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Language: {currentLocale}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {currentLocale === 'zh' ? '中文内容' : 'English Content'}
              </h3>
              <p className="text-gray-600">
                {currentLocale === 'zh' 
                  ? '这是一个测试页面，用于验证语言切换功能是否正常工作。' 
                  : 'This is a test page to verify that the language switching functionality works correctly.'
                }
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                {currentLocale === 'zh' ? '功能测试' : 'Feature Test'}
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>
                  {currentLocale === 'zh' 
                    ? '语言选择器应该显示当前选中的语言' 
                    : 'Language selector should show currently selected language'
                  }
                </li>
                <li>
                  {currentLocale === 'zh' 
                    ? '点击切换语言时，界面内容应该立即更新' 
                    : 'When clicking to switch language, interface content should update immediately'
                  }
                </li>
                <li>
                  {currentLocale === 'zh' 
                    ? '报告生成应该使用选中的语言' 
                    : 'Report generation should use the selected language'
                  }
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

