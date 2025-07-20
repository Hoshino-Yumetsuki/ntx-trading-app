'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Translations, SupportedLanguage, TranslationKey } from '@/src/types/i18n'

// 导入翻译文件
import zhTranslations from '@/src/locales/zh.json'
import enTranslations from '@/src/locales/en.json'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: TranslationKey, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻译资源映射
const translations: Record<SupportedLanguage, Translations> = {
  zh: zhTranslations as Translations,
  en: enTranslations as Translations
}

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('zh')

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // 保存语言设置到 localStorage
  const handleSetLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // 翻译函数
  const t = (key: TranslationKey, fallback?: string): string => {
    const translation = getNestedValue(translations[language], key)
    
    if (translation) {
      return translation
    }
    
    // 如果当前语言没有翻译，尝试使用英文
    if (language !== 'en') {
      const englishTranslation = getNestedValue(translations.en, key)
      if (englishTranslation) {
        return englishTranslation
      }
    }
    
    // 如果有 fallback，使用 fallback
    if (fallback) {
      return fallback
    }
    
    // 最后返回 key 本身
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

// 导出类型以供其他文件使用
export type { SupportedLanguage, TranslationKey }
