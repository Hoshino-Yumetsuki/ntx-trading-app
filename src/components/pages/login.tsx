'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
// 移除不再使用的UI组件导入
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/src/contexts/AuthContext'
import {
  register as registerUser,
  sendVerificationCode
} from '@/src/services/auth'
import { toast } from 'sonner'
import { TermsModal } from '@/src/components/ui/terms-modal'
import { useLanguage } from '@/src/contexts/language-context'

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

export function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingVerification, setIsLoadingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>(
    'terms'
  )
  const { login, isLoading } = useAuth()
  const { t } = useLanguage()

  const loginSchema = createLoginSchema(t)
  const registerSchema = createRegisterSchema(t)

  type LoginFormData = z.infer<typeof loginSchema>
  type RegisterFormData = z.infer<typeof registerSchema>

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  // 移除动态表单切换，直接在JSX中使用对应的表单

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.loginFailed')
      )
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser({
        email: data.email,
        nickname: data.nickname,
        verification_code: data.verification_code,
        password: data.password,
        invite_code: data.invite_code
      })
      toast.success(t('login.success.registerSuccess'))
      setIsRegisterMode(false)
      registerForm.reset()
      loginForm.reset()
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* 只在注册页面显示横幅文字 */}
        {isRegisterMode && (
          <div className="mb-8 mt-6">
            <div className="text-left mb-3">
              <h3 className="text-3xl font-extrabold text-blue-700">
                {t('login.banner.joinNow')}
              </h3>
              <h3 className="text-2xl font-bold mb-3 text-blue-700">
                {t('login.banner.platform')}
              </h3>
            </div>
            <div className="text-sm text-left text-gray-600 flex items-center">
              <span>{t('login.banner.exchanges')}</span>
              <span className="mx-1">{t('login.banner.joinedExchanges')}</span>
              <span className="ml-1 bg-gray-100 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            {isRegisterMode ? t('login.register.title') : t('login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegisterMode
              ? t('login.register.subtitle')
              : t('login.subtitle')}
          </p>
        </div>

        {!isRegisterMode ? (
          // 登录表单
          <form
            className="mt-8 space-y-6"
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          >
            <div className="space-y-4">
              {/* 邮箱字段 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.email.label')}
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  id="email"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    loginForm.formState.errors.email
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder={t('login.email.placeholder')}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* 密码字段 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.password.label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      loginForm.formState.errors.password
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
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

            <div>
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting || isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(loginForm.formState.isSubmitting || isLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {t('login.loginButton')}
              </button>
            </div>
          </form>
        ) : (
          // 注册表单
          <form
            className="mt-8 space-y-6"
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          >
            <div className="space-y-4">
              {/* 邮箱字段 */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.email.label')}
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  id="email"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    registerForm.formState.errors.email
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder={t('login.email.placeholder')}
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* 昵称字段 */}
              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.nickname.label')}
                </label>
                <input
                  {...registerForm.register('nickname')}
                  type="text"
                  id="nickname"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    registerForm.formState.errors.nickname
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder={t('login.nickname.placeholder')}
                />
                {registerForm.formState.errors.nickname && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.nickname.message}
                  </p>
                )}
              </div>

              {/* 验证码字段 */}
              <div>
                <label
                  htmlFor="verification_code"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.verificationCode.label')}
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    {...registerForm.register('verification_code')}
                    type="text"
                    id="verification_code"
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      registerForm.formState.errors.verification_code
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('login.verificationCode.placeholder')}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isLoadingVerification}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* 邀请码字段 */}
              <div>
                <label
                  htmlFor="invite_code"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.inviteCode.label')}
                </label>
                <input
                  {...registerForm.register('invite_code')}
                  type="text"
                  id="invite_code"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    registerForm.formState.errors.invite_code
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder={t('login.inviteCode.placeholder')}
                />
                {registerForm.formState.errors.invite_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.invite_code.message}
                  </p>
                )}
              </div>

              {/* 密码字段 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.password.label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      registerForm.formState.errors.password
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
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

              {/* 确认密码字段 */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('login.confirmPassword.label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      registerForm.formState.errors.confirmPassword
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder={t('login.confirmPassword.placeholder')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            {/* 同意条款勾选框 */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...registerForm.register('agreeToTerms')}
                  id="agreeToTerms"
                  type="checkbox"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerForm.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {t('login.registerButton')}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {isRegisterMode
              ? t('login.switchToLogin')
              : t('login.switchToRegister')}
          </button>
        </div>
      </div>

      {/* 服务条款和隐私政策模态框 */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={termsModalType}
      />
    </div>
  )
}
