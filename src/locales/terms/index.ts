import { termsZh } from './zh'
import { termsEn } from './en'

export type TermsType = 'terms' | 'privacy'
export type Language = 'zh' | 'en'

export function getTermsContent(type: TermsType, language: Language): string {
  const content = language === 'zh' ? termsZh : termsEn
  return content[type]
}

export { termsZh, termsEn }
