"use client";

import { Suspense } from "react";
import { LoginPage } from "@/src/components/pages/login";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { LanguageProvider } from "@/src/contexts/language-context";

function LoginAppContent() {
  return <LoginPage initialMode="login" />;
}

export default function LoginRoutePage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <LoginAppContent />
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
}
