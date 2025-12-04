'use client'

import { useState, useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import {
  ArrowLeft,
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Wallet,
  Mail,
  Hash,
  Copy
} from 'lucide-react'
import Image from 'next/image'
import { UserService } from '@/src/services/user'
import { useAuth } from '@/src/contexts/AuthContext'
import { toast } from 'sonner'
import { useWeb3Modal, useWeb3ModalAccount } from '@/src/contexts/WalletContext'
import type { UserInfo } from '@/src/types/user'
import { useLanguage } from '@/src/contexts/language-context'

// Schema will be created inside component to use i18n
type PasswordFormData = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

type NicknameFormData = {
  nickname: string
}

interface SecuritySettingsProps {
  onBack: () => void
  userInfo: UserInfo | null
  refetchUserInfo: () => void
}

type EditMode = 'none' | 'password' | 'nickname'

export function SecuritySettings({
  onBack,
  userInfo,
  refetchUserInfo
}: SecuritySettingsProps) {
  const oldPasswordId = useId()
  const newPasswordId = useId()
  const confirmPasswordId = useId()
  const nicknameId = useId()

  const { t } = useLanguage()
  const { user, updateUser, logout } = useAuth()
  const { open } = useWeb3Modal()
  const { address: walletAddress, isConnected } = useWeb3ModalAccount()

  // Create schemas with i18n messages
  const passwordSchema = z
    .object({
      oldPassword: z.string().min(1, t('security.password.currentRequired')),
      newPassword: z
        .string()
        .min(8, t('security.password.minLength'))
        .max(32, t('security.password.maxLength'))
        .regex(/[A-Z]/, t('security.password.requireUppercase')),
      confirmPassword: z.string().min(1, t('security.password.confirmRequired'))
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('security.password.mismatch'),
      path: ['confirmPassword']
    })

  const nicknameSchema = z.object({
    nickname: z.string().min(1, t('security.nickname.required')).max(50, t('security.nickname.maxLength'))
  })

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>('none')
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null)

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const nicknameForm = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: user?.nickname || ''
    }
  })

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (logoutCountdown !== null && logoutCountdown > 0) {
      intervalId = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev === null || prev <= 1) {
            setTimeout(() => logout(), 0)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [logoutCountdown, logout])

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}${t('common.copied')}`)
    } catch (_error) {
      toast.error(t('common.copyFailed'))
    }
  }

  const handleCancelEdit = () => {
    setEditMode('none')
    passwordForm.reset()
    nicknameForm.reset()
    setSuccess(false)
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true)
    setSuccess(false)
    try {
      await UserService.updatePassword(data.oldPassword, data.newPassword)
      setSuccess(true)
      passwordForm.reset()
      setEditMode('none')
      toast.success(t('security.password.updateSuccess'))
      setLogoutCountdown(3)
    } catch (error) {
      toast.error(
        t('security.password.updateFailed') +
          (error instanceof Error ? error.message : t('common.error.refreshPage'))
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onNicknameSubmit = async (data: NicknameFormData) => {
    try {
      await UserService.updateNickname(data.nickname)
      updateUser({ nickname: data.nickname })
      setEditMode('none')
      toast.success(t('security.nickname.updateSuccess'))
      nicknameForm.reset()
    } catch (error) {
      toast.error(
        t('security.nickname.updateFailed') +
          (error instanceof Error ? error.message : t('common.error.refreshPage'))
      )
    }
  }

  const handleBindBscAddress = async () => {
    if (!walletAddress) {
      toast.error(t('security.wallet.connectFirst'))
      return
    }
    try {
      await UserService.bindBscAddress(walletAddress)
      toast.success(t('security.wallet.bindSuccess'))
      refetchUserInfo()
    } catch (error) {
      toast.error(
        t('security.wallet.bindFailed') +
          (error instanceof Error ? error.message : t('common.error.refreshPage'))
      )
    }
  }

  const securityItems = [
    {
      icon: User,
      title: t('profile.menu.security.nickname'),
      description: userInfo?.nickname || t('security.field.notSet'),
      status: userInfo?.nickname ? 'completed' : 'pending',
      action: t('common.edit'),
      onClick: () => setEditMode('nickname'),
      copyable: false
    },
    {
      icon: Hash,
      title: t('profile.menu.security.uid'),
      description: userInfo?.id?.toString() || t('security.field.notFetched'),
      status: userInfo?.id ? 'completed' : 'pending',
      action: '',
      onClick: () => {},
      copyable: true
    },
    {
      icon: Mail,
      title: t('profile.menu.security.email'),
      description: userInfo?.email || t('security.field.notSet'),
      status: userInfo?.email ? 'completed' : 'pending',
      action: '',
      onClick: () => {},
      copyable: true
    },
    {
      icon: Key,
      title: t('profile.menu.security.password'),
      description: t('profile.menu.security.passwordSet'),
      status: 'completed',
      action: t('common.edit'),
      onClick: () => setEditMode('password'),
      copyable: false
    },
    {
      icon: Wallet,
      title: t('profile.menu.security.bscAddress'),
      description: userInfo?.bscAddress || t('security.field.notBound'),
      status: userInfo?.bscAddress ? 'completed' : 'pending',
      action: '',
      onClick: () => {},
      copyable: !!userInfo?.bscAddress
    }
  ]

  const getBindButtonState = () => {
    if (!isConnected || !walletAddress) {
      return {
        text: t('profile.menu.security.connectWallet'),
        disabled: false,
        action: () => open()
      }
    }

    const isSameAddress =
      !!userInfo?.bscAddress &&
      userInfo.bscAddress.toLowerCase() === walletAddress.toLowerCase()

    if (isSameAddress) {
      return { text: t('security.wallet.bound'), disabled: true, action: () => {} }
    }

    if (userInfo?.bscAddress) {
      return {
        text: t('security.wallet.updateBind'),
        disabled: false,
        action: handleBindBscAddress
      }
    }

    return {
      text: t('security.wallet.bind'),
      disabled: false,
      action: handleBindBscAddress
    }
  }

  const bindButtonState = getBindButtonState()

  return (
    <div className="min-h-screen">
      <div className="px-6 pt-12 pb-2 relative z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative w-28 h-9 md:w-32 md:h-10">
            <Image
              src="/logo.png"
              alt="NTX Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="relative mb-6 rounded-[16pt] overflow-visible">
          <div className="relative h-32">
            <div className="relative z-10 h-full flex items-center pl-4 pr-48 md:pr-56">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">
                  {t('profile.menu.security.header')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {t('profile.menu.security.subtitle')}
                </p>
              </div>
            </div>
            <div className="absolute -right-2 md:-right-3 top-1/2 -translate-y-1/2 w-56 h-56 md:w-64 md:h-64 z-0 pointer-events-none">
              <Image
                src="/security-icon.png"
                alt="Security Header"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {logoutCountdown !== null && (
        <div className="px-6 py-2">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {t('security.password.logoutCountdown')}{' '}
              <span className="font-bold text-orange-900">
                {logoutCountdown}
              </span>{' '}
              {t('common.time.seconds')}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        <Card className="glass-card border-white/30 rounded-[16pt]">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>{t('profile.menu.security.securityStatus')}</span>
            </CardTitle>
            <CardDescription>
              {t('profile.menu.security.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityItems.map((item, index, arr) => {
              const Icon = item.icon
              return (
                <div key={index}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-3">
                      <div className="premium-icon w-10 h-10 rounded-[16pt]">
                        <Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-medium">
                          {item.title}
                        </p>
                        <p className="text-slate-600 text-sm break-all">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {item.status === 'pending' &&
                        item.title !==
                          t('profile.menu.security.bscAddress') && (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      {item.copyable &&
                        item.description &&
                        item.description !== t('security.field.notSet') &&
                        item.description !== t('security.field.notFetched') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopy(item.description, item.title)
                            }
                            className="p-2"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      {item.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={item.onClick}
                        >
                          {item.action}
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="border-t border-slate-200"></div>
                  )}
                </div>
              )
            })}
            <div className="pt-4 space-y-3">
              {!isConnected ? (
                <Button onClick={() => open()} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('profile.menu.security.connectWallet')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      {t('profile.menu.security.walletConnected')}
                    </p>
                    <p className="text-sm font-mono text-blue-900 break-all">
                      {walletAddress}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={bindButtonState.action}
                      className="flex-1"
                      disabled={bindButtonState.disabled}
                    >
                      {bindButtonState.text}
                    </Button>
                    <Button
                      onClick={() => open({ view: 'Account' })}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('security.wallet.switchOrDisconnect')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {editMode === 'password' && (
          <Card className="glass-card border-white/30 rounded-[16pt]">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>{t('security.password.change')}</span>
              </CardTitle>
              <CardDescription>{t('security.password.changeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {t('security.password.changeSuccessMessage')}
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={oldPasswordId}>{t('security.password.current')}</Label>
                  <div className="relative">
                    <Input
                      id={oldPasswordId}
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder={t('security.password.currentPlaceholder')}
                      autoComplete="current-password"
                      {...passwordForm.register('oldPassword')}
                      className={
                        passwordForm.formState.errors.oldPassword
                          ? 'border-red-500 pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                          : 'pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.oldPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={newPasswordId}>{t('security.password.new')}</Label>
                  <div className="relative">
                    <Input
                      id={newPasswordId}
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={t('security.password.newPlaceholder')}
                      autoComplete="new-password"
                      {...passwordForm.register('newPassword')}
                      className={
                        passwordForm.formState.errors.newPassword
                          ? 'border-red-500 pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                          : 'pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={confirmPasswordId}>{t('security.password.confirm')}</Label>
                  <div className="relative">
                    <Input
                      id={confirmPasswordId}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('security.password.confirmPlaceholder')}
                      autoComplete="new-password"
                      {...passwordForm.register('confirmPassword')}
                      className={
                        passwordForm.formState.errors.confirmPassword
                          ? 'border-red-500 pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                          : 'pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEdit}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 premium-gradient text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.changing') : t('common.confirmChange')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {editMode === 'nickname' && (
          <Card className="glass-card border-white/30 rounded-[16pt]">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>{t('security.nickname.update')}</span>
              </CardTitle>
              <CardDescription>{t('security.nickname.updateDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={nicknameForm.handleSubmit(onNicknameSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={nicknameId}>{t('security.nickname.label')}</Label>
                  <Input
                    id={nicknameId}
                    type="text"
                    placeholder={t('security.nickname.placeholder')}
                    defaultValue={user?.nickname || ''}
                    {...nicknameForm.register('nickname')}
                    className={
                      nicknameForm.formState.errors.nickname
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {nicknameForm.formState.errors.nickname && (
                    <p className="text-sm text-red-500">
                      {nicknameForm.formState.errors.nickname.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelEdit}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 premium-gradient text-white"
                  >
                    {t('common.confirmUpdate')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
