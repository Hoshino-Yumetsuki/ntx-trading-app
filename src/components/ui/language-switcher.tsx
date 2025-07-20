'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { useLanguage } from '@/src/contexts/language-context'
import { Globe, ChevronDown } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectLanguage = (langCode: 'zh' | 'en') => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 hover:bg-white/50"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                setIsOpen(false)
              }
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-xl shadow-lg border border-white/20 overflow-hidden min-w-[140px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => selectLanguage(lang.code as 'zh' | 'en')}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center space-x-3 ${
                  language === lang.code
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {language === lang.code && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
