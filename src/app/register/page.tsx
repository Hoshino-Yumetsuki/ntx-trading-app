'use client'

import { useSearchParams } from 'next/navigation'
import { LoginPage } from '@/src/components/pages/login'
import { AuthProvider } from '@/src/contexts/AuthContext'
import { LanguageProvider } from '@/src/contexts/language-context'

function RegisterAppContent() {
  const searchParams = useSearchParams()
  const invite = searchParams.get('invite') || ''

  return <LoginPage initialMode="register" initialInviteCode={invite} />
}

export default function RegisterPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RegisterAppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}
