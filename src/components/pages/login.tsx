'use client'

import { useState, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'
import {
  register as registerUser,
  sendVerificationCode,
  forgotPassword,
  resetPassword
} from '@/src/services/auth'
import { toast } from 'sonner'
import { TermsModal } from '@/src/components/ui/terms-modal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { useLanguage } from '@/src/contexts/language-context'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('validation.email.invalid')),
    password: z.string().min(1, t('validation.password.required'))
  })

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().email(t('validation.email.invalid')),
      nickname: z
        .string()
        .min(2, t('validation.nickname.minLength'))
        .max(20, t('validation.nickname.maxLength')),
      verification_code: z
        .string()
        .min(6, t('validation.verificationCode.length')),
      password: z
        .string()
        .min(8, t('validation.password.minLength'))
        .max(128, t('validation.password.maxLength'))
        .regex(/^(?=.*[a-z])/, t('validation.password.lowercase'))
        .regex(/^(?=.*\d)/, t('validation.password.number'))
        .regex(/^(?=.*[A-Z])/, t('validation.password.uppercase')),
      confirmPassword: z.string(),
      invite_code: z.string().optional(),
      agreeToTerms: z.boolean().refine((val) => val === true, {
        message: t('validation.terms.required')
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword']
    })

interface LoginPageProps {
  initialMode?: 'login' | 'register'
  initialInviteCode?: string
}

export function LoginPage({
  initialMode = 'login',
  initialInviteCode = ''
}: LoginPageProps) {
  const emailId = useId()
  const passwordId = useId()
  const nicknameId = useId()
  const verificationCodeId = useId()
  const inviteCodeId = useId()
  const confirmPasswordId = useId()
  const agreeToTermsId = useId()

  const [isRegisterMode, setIsRegisterMode] = useState(
    initialMode === 'register'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingVerification, setIsLoadingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>(
    'terms'
  )
  const [showForgotDialog, setShowForgotDialog] = useState(false)
  const [fpEmail, setFpEmail] = useState('')
  const [fpSending, setFpSending] = useState(false)
  const [rpEmail, setRpEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [rpSubmitting, setRpSubmitting] = useState(false)
  const { login, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const loginSchema = createLoginSchema(t)
  const registerSchema = createRegisterSchema(t)

  type LoginFormData = z.infer<typeof loginSchema>
  type RegisterFormData = z.infer<typeof registerSchema>

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { invite_code: initialInviteCode }
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
      const next = searchParams.get('next')
      if (next === 'profile') {
        try {
          localStorage.setItem('ntx-active-tab', 'profile')
        } catch {}
      }
      router.push('/')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.loginFailed')
      )
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      const inviteCode = (data.invite_code ?? '').trim() || 'ABCDEFGH'
      await registerUser({
        email: data.email,
        nickname: data.nickname,
        verification_code: data.verification_code,
        password: data.password,
        invite_code: inviteCode
      })
      toast.success(t('login.success.registerSuccess'))
      setIsRegisterMode(false)
      registerForm.reset()
      loginForm.reset()
      const next = searchParams.get('next')
      if (next === 'profile') {
        try {
          localStorage.setItem('ntx-active-tab', 'profile')
        } catch {}
      }
      router.push('/')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.registerFailed')
      )
    }
  }

  const handleSendVerificationCode = async () => {
    const email = registerForm.getValues('email')
    if (!email) {
      setError(t('login.error.emailRequired'))
      return
    }

    try {
      setIsLoadingVerification(true)
      setError(null)
      await sendVerificationCode({ email })
      setVerificationSent(true)
      toast.success(t('login.success.codesSent'))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.sendCodeFailed')
      )
    } finally {
      setIsLoadingVerification(false)
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setError(null)
    setVerificationSent(false)
    loginForm.reset()
    registerForm.reset()
  }

  const openForgotDialog = () => {
    const loginEmail = loginForm.getValues('email')
    setFpEmail(loginEmail || '')
    setRpEmail(loginEmail || '')
    setShowForgotDialog(true)
  }

  const handleSendResetCode = async () => {
    const email = fpEmail.trim()
    if (!email) {
      toast.error(t('login.error.emailRequired'))
      return
    }
    try {
      setFpSending(true)
      await forgotPassword({ email })
      toast.success(t('login.success.resetCodeSent'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('login.error.sendResetCodeFailed'))
    } finally {
      setFpSending(false)
    }
  }

  const handleSubmitReset = async () => {
    const email = rpEmail.trim()
    if (!email) return toast.error(t('login.error.emailRequired'))
    if (!resetCode.trim()) return toast.error(t('login.error.resetCodeRequired'))
    if (!newPwd) return toast.error(t('login.error.newPasswordRequired'))
    if (newPwd.length < 8) return toast.error(t('login.error.passwordMinLength'))
    if (newPwd !== newPwd2) return toast.error(t('login.error.passwordMismatch'))
    try {
      setRpSubmitting(true)
      await resetPassword({
        email,
        reset_code: resetCode.trim(),
        new_password: newPwd
      })
      toast.success(t('login.success.passwordReset'))
      setShowForgotDialog(false)
      setResetCode('')
      setNewPwd('')
      setNewPwd2('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('login.error.resetPasswordFailed'))
    } finally {
      setRpSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative overflow-visible">
        <div className="px-6 pt-12 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative h-48 md:h-56 overflow-visible">
              <div className="relative z-10 h-full flex items-center pr-48 md:pr-56">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {t('login.banner.title')}
                  </h1>
                  <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-4">
                    {t('login.banner.subtitle')}
                  </h2>
                  <p className="text-slate-600 text-sm md:text-base">
                    {t('login.banner.description')}
                  </p>
                </div>
              </div>
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-0 pointer-events-none ${
                  isRegisterMode
                    ? 'right-0 w-48 h-48 md:w-56 md:h-56 overflow-visible'
                    : '-right-2 md:-right-3 w-56 h-56 md:w-64 md:h-64'
                }`}
              >
                <Image
                  src={isRegisterMode ? '/register-bg.png' : '/login-bg.png'}
                  alt={
                    isRegisterMode
                      ? 'Register Illustration'
                      : 'Login Illustration'
                  }
                  fill
                  className="object-contain object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          {isRegisterMode && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  if (pathname === '/register') {
                    router.push('/')
                  } else {
                    toggleMode()
                  }
                }}
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('login.backToLogin')}
              </button>
            </div>
          )}

          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {isRegisterMode ? t('login.register.title') : t('login.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isRegisterMode
                ? t('login.register.subtitle')
                : t('login.subtitle')}
            </p>
          </div>

          {!isRegisterMode ? (
            <form
              className="mt-8 space-y-8"
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.email.label')}
                  </label>
                  <div
                    className={`mt-2 glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      loginForm.formState.errors.email
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      id={emailId}
                      className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.email.placeholder')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.password.label')}
                  </label>
                  <div
                    className={`mt-2 relative glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      loginForm.formState.errors.password
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id={passwordId}
                      className="block w-full bg-transparent border-0 pr-10 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.password.placeholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={openForgotDialog}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting || isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loginForm.formState.isSubmitting || isLoading) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t('login.loginButton')}
                </button>
              </div>
            </form>
          ) : (
            <form
              className="mt-8 space-y-8"
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.email.label')}
                  </label>
                  <div
                    className={`mt-2 glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      registerForm.formState.errors.email
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...registerForm.register('email')}
                      type="email"
                      id={emailId}
                      className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.email.placeholder')}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="nickname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.nickname.label')}
                  </label>
                  <div
                    className={`mt-2 glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      registerForm.formState.errors.nickname
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...registerForm.register('nickname')}
                      type="text"
                      id={nicknameId}
                      className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.nickname.placeholder')}
                    />
                  </div>
                  {registerForm.formState.errors.nickname && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.nickname.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="verification_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.verificationCode.label')}
                  </label>
                  <div className="mt-2 flex space-x-3">
                    <div className="flex-1">
                      <div
                        className={`glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                          registerForm.formState.errors.verification_code
                            ? 'border-red-300'
                            : 'border-white/30'
                        }`}
                      >
                        <input
                          {...registerForm.register('verification_code')}
                          type="text"
                          id={verificationCodeId}
                          className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                          placeholder={t('login.verificationCode.placeholder')}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isLoadingVerification}
                      className="h-12 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingVerification ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : verificationSent ? (
                        t('login.resendCode')
                      ) : (
                        t('login.sendCode')
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.verification_code && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.verification_code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="invite_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.inviteCode.label')}
                  </label>
                  <div
                    className={`mt-2 glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      registerForm.formState.errors.invite_code
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...registerForm.register('invite_code')}
                      type="text"
                      id={inviteCodeId}
                      className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.inviteCode.placeholder')}
                    />
                  </div>
                  {registerForm.formState.errors.invite_code && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.invite_code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.password.label')}
                  </label>
                  <div
                    className={`mt-2 relative glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      registerForm.formState.errors.password
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...registerForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id={passwordId}
                      className="block w-full bg-transparent border-0 pr-10 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.password.register.placeholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('login.confirmPassword.label')}
                  </label>
                  <div
                    className={`mt-2 relative glass-card rounded-[12px] border px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-indigo-500 ${
                      registerForm.formState.errors.confirmPassword
                        ? 'border-red-300'
                        : 'border-white/30'
                    }`}
                  >
                    <input
                      {...registerForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id={confirmPasswordId}
                      className="block w-full bg-transparent border-0 pr-10 text-sm focus:outline-none focus:ring-0"
                      placeholder={t('login.confirmPassword.placeholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="mt-4 flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...registerForm.register('agreeToTerms')}
                    id={agreeToTermsId}
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={agreeToTermsId} className="text-gray-700">
                    {t('login.agreeTerms')}
                    <button
                      type="button"
                      onClick={() => {
                        setTermsModalType('terms')
                        setShowTermsModal(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-500 mx-1 underline"
                    >
                      {t('login.termsOfService')}
                    </button>
                    {t('login.and')}
                    <button
                      type="button"
                      onClick={() => {
                        setTermsModalType('privacy')
                        setShowTermsModal(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-500 mx-1 underline"
                    >
                      {t('login.privacyPolicy')}
                    </button>
                  </label>
                  {registerForm.formState.errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.agreeToTerms.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerForm.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t('login.registerButton')}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                if (isRegisterMode) {
                  router.push('/')
                } else {
                  router.push('/register')
                }
              }}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              {isRegisterMode
                ? t('login.switchToLogin')
                : t('login.switchToRegister')}
            </button>
          </div>

          {!isRegisterMode && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                aria-label={t('common.back')}
              >
                {t('login.backToHome')}
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t('login.dialog.recoverPassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                {t('login.email.label')}
              </div>
              <div className="glass-card rounded-[12px] border px-3 h-11 flex items-center border-white/30">
                <input
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  type="email"
                  className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder={t('login.email.placeholder')}
                />
              </div>
              <button
                type="button"
                onClick={handleSendResetCode}
                disabled={fpSending}
                className="w-full h-10 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fpSending ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                ) : null}
                {t('login.sendResetCode')}
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                {t('login.email.label')}
              </div>
              <div className="glass-card rounded-[12px] border px-3 h-11 flex items-center border-white/30">
                <input
                  value={rpEmail}
                  onChange={(e) => setRpEmail(e.target.value)}
                  type="email"
                  className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder={t('login.email.placeholder')}
                />
              </div>

              <div className="text-sm font-medium text-gray-700">
                {t('login.resetCode.label')}
              </div>
              <div className="glass-card rounded-[12px] border px-3 h-11 flex items-center border-white/30">
                <input
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  type="text"
                  className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder={t('login.resetCode.placeholder')}
                />
              </div>

              <div className="text-sm font-medium text-gray-700">
                {t('login.newPassword.label')}
              </div>
              <div className="glass-card rounded-[12px] border px-3 h-11 flex items-center border-white/30">
                <input
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  type="password"
                  className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder={t('login.newPassword.placeholder')}
                />
              </div>

              <div className="text-sm font-medium text-gray-700">
                {t('login.confirmNewPassword.label')}
              </div>
              <div className="glass-card rounded-[12px] border px-3 h-11 flex items-center border-white/30">
                <input
                  value={newPwd2}
                  onChange={(e) => setNewPwd2(e.target.value)}
                  type="password"
                  className="block w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder={t('login.confirmNewPassword.placeholder')}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitReset}
                disabled={rpSubmitting}
                className="w-full h-10 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {rpSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                ) : null}
                {t('login.submitReset')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={termsModalType}
      />
    </div>
  )
}
