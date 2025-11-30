'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import type {
  SupportedLanguage,
  TranslationKey
} from '@/src/types/i18n'

type Translations = Record<string, any>

import zhTranslations from '@/src/locales/zh.json'
import enTranslations from '@/src/locales/en.json'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: TranslationKey, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

const translations: Record<SupportedLanguage, Translations> = {
  zh: zhTranslations as Translations,
  en: enTranslations as Translations
}

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('zh')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: TranslationKey, fallback?: string): string => {
    const translation = getNestedValue(translations[language], key)

    if (translation) {
      return translation
    }

    if (language !== 'en') {
      const englishTranslation = getNestedValue(translations.en, key)
      if (englishTranslation) {
        return englishTranslation
      }
    }

    if (fallback) {
      return fallback
    }

    console.warn(`Translation missing for key: ${key}`)
    return key
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export type { SupportedLanguage, TranslationKey }
