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

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码')
})

const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    nickname: z
      .string()
      .min(2, '昵称至少需要2个字符')
      .max(20, '昵称不能超过20个字符'),
    verification_code: z.string().min(6, '验证码为6位数字'),
    password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .max(128, '密码不能超过128个字符')
      .regex(/^(?=.*[a-z])/, '密码必须包含至少一个小写字母')
      .regex(/^(?=.*\d)/, '密码必须包含至少一个数字')
      .regex(/^(?=.*[A-Z])/, '密码必须包含至少一个大写字母'),
    confirmPassword: z.string(),
    invite_code: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: '请同意服务条款和隐私政策'
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

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
      setError(err instanceof Error ? err.message : '登录失败，请重试')
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
      toast.success('注册成功！请登录')
      setIsRegisterMode(false)
      registerForm.reset()
      loginForm.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
    }
  }

  const handleSendVerificationCode = async () => {
    const email = registerForm.getValues('email')
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }

    try {
      setIsLoadingVerification(true)
      setError(null)
      await sendVerificationCode({ email })
      setVerificationSent(true)
      toast.success('验证码已发送到您的邮箱')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败')
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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isRegisterMode ? '注册账户' : '登录账户'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegisterMode ? '创建您的NTX交易账户' : '欢迎回到NTX交易平台'}
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
                  邮箱地址
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
                  placeholder="请输入邮箱地址"
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
                  密码
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
                    placeholder="请输入密码"
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
                登录
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
                  邮箱地址
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
                  placeholder="请输入邮箱地址"
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
                  昵称
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
                  placeholder="请输入昵称"
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
                  邮箱验证码
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
                    placeholder="请输入验证码"
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
                      '重新发送'
                    ) : (
                      '发送验证码'
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
                  邀请码（可选）
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
                  placeholder="请输入邀请码（可选）"
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
                  密码
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
                    placeholder="请输入密码（至少8位，包含字母和数字）"
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
                  确认密码
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
                    placeholder="请再次输入密码"
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
                  我已阅读并同意
                  <button
                    type="button"
                    onClick={() => {
                      setTermsModalType('terms')
                      setShowTermsModal(true)
                    }}
                    className="text-indigo-600 hover:text-indigo-500 mx-1 underline"
                  >
                    服务条款
                  </button>
                  和
                  <button
                    type="button"
                    onClick={() => {
                      setTermsModalType('privacy')
                      setShowTermsModal(true)
                    }}
                    className="text-indigo-600 hover:text-indigo-500 mx-1 underline"
                  >
                    隐私政策
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
                注册
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
            {isRegisterMode ? '已有账户？点击登录' : '没有账户？点击注册'}
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
