'use client'

import { LanguageProvider } from '@/src/contexts/language-context'
import { Web3ModalProvider } from '@/src/contexts/WalletContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3ModalProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </Web3ModalProvider>
  )
}
