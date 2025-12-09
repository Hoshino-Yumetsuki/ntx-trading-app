'use client'

import { LanguageProvider } from '@/src/contexts/language-context'
import { Web3ModalProvider } from '@/src/contexts/WalletContext'
import { ServiceWorkerRegister } from '@/src/components/pwa-register'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3ModalProvider>
      <LanguageProvider>
        <ServiceWorkerRegister />
        {children}
      </LanguageProvider>
    </Web3ModalProvider>
  )
}
