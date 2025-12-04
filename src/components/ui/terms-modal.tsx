'use client'

import { X } from 'lucide-react'
import { useLanguage } from '@/src/contexts/language-context'
import { getTermsContent } from '@/src/locales/terms'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'terms' | 'privacy'
}

export function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
  const { t, language } = useLanguage()

  if (!isOpen) return null

  const title = type === 'terms' ? t('ui.terms.title') : t('ui.privacy.title')
  const content = getTermsContent(type, language)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
              {content}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('ui.terms.understood')}
          </button>
        </div>
      </div>
    </div>
  )
}
