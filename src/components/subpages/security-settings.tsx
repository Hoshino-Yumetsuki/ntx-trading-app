'use client'

import { useState, useEffect } from 'react'
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
import { UserService } from '@/src/services/user'
import { useAuth } from '@/src/contexts/AuthContext'
import { toast } from 'sonner'

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, '请输入当前密码'),
    newPassword: z
      .string()
      .min(8, '密码至少8个字符')
      .max(32, '密码最多32个字符')
      .regex(/[A-Z]/, '密码必须包含至少一个大写字母'),
    confirmPassword: z.string().min(1, '请确认新密码')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

const nicknameSchema = z.object({
  nickname: z.string().min(1, '请输入昵称').max(50, '昵称最多50个字符')
})

const bscAddressSchema = z.object({
  bscAddress: z
    .string()
    .min(1, '请输入BSC地址')
    .regex(/^0x[a-fA-F0-9]{40}$/, '请输入有效的BSC地址')
})

type PasswordFormData = z.infer<typeof passwordSchema>
type NicknameFormData = z.infer<typeof nicknameSchema>
type BscAddressFormData = z.infer<typeof bscAddressSchema>

interface SecuritySettingsProps {
  onBack: () => void
}

type EditMode = 'none' | 'password' | 'nickname' | 'bscAddress'

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const { user, updateUser, logout } = useAuth()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>('none')
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null)

  // 密码表单
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  // 昵称表单
  const nicknameForm = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: user?.nickname || ''
    }
  })

  // BSC地址表单
  const bscAddressForm = useForm<BscAddressFormData>({
    resolver: zodResolver(bscAddressSchema)
  })

  // 倒计时逻辑
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (logoutCountdown !== null && logoutCountdown > 0) {
      intervalId = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev === null || prev <= 1) {
            logout()
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [logoutCountdown, logout])

  // 复制到剪贴板
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}已复制到剪贴板`)
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditMode('none')
    // 重置所有表单
    passwordForm.reset()
    nicknameForm.reset()
    bscAddressForm.reset()
    setSuccess(false)
  }

  // 处理表单提交
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true)
    setSuccess(false)

    try {
      await UserService.updatePassword(data.oldPassword, data.newPassword)
      setSuccess(true)
      passwordForm.reset()
      setEditMode('none') // 提交成功后退出编辑模式
      toast.success('密码修改成功！')

      // 启动倒计时
      setLogoutCountdown(3)
    } catch (error) {
      console.error('Password update failed:', error)
      toast.error(
        '密码修改失败：' +
          (error instanceof Error ? error.message : '请稍后重试')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onNicknameSubmit = async (data: NicknameFormData) => {
    try {
      await UserService.updateNickname(data.nickname)
      // 更新AuthContext中的用户信息
      updateUser({ nickname: data.nickname })
      setEditMode('none')
      toast.success('昵称更新成功')
      nicknameForm.reset()
    } catch (error) {
      console.error('Nickname update failed:', error)
      toast.error(
        '昵称更新失败：' +
          (error instanceof Error ? error.message : '请稍后重试')
      )
    }
  }

  const onBscAddressSubmit = async (data: BscAddressFormData) => {
    try {
      await UserService.bindBscAddress(data.bscAddress)
      setEditMode('none')
      toast.success('BSC地址绑定成功')
      bscAddressForm.reset()
    } catch (error) {
      console.error('BSC address binding failed:', error)
      toast.error(
        'BSC地址绑定失败：' +
          (error instanceof Error ? error.message : '请稍后重试')
      )
    }
  }

  const securityItems = [
    {
      icon: User,
      title: '用户昵称',
      description: user?.nickname || '未设置',
      status: user?.nickname ? 'completed' : 'pending',
      action: '修改',
      onClick: () => setEditMode('nickname'),
      copyable: false
    },
    {
      icon: Hash,
      title: '用户UID',
      description: user?.id?.toString() || '未获取',
      status: user?.id ? 'completed' : 'pending',
      action: '',
      onClick: () => {},
      copyable: true
    },
    {
      icon: Mail,
      title: '电子邮箱',
      description: user?.email || '未设置',
      status: user?.email ? 'completed' : 'pending',
      action: '',
      onClick: () => {},
      copyable: true
    },
    {
      icon: Key,
      title: '登录密码',
      description: '已设置',
      status: 'completed',
      action: '修改',
      onClick: () => setEditMode('password'),
      copyable: false
    },
    {
      icon: Wallet,
      title: 'BSC钱包地址',
      description: '点击绑定或更新',
      status: 'pending',
      action: '绑定',
      onClick: () => setEditMode('bscAddress'),
      copyable: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="glass-card-strong px-6 py-4 flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">安全设置</h1>
        </div>
      </div>

      {/* 倒计时提示 */}
      {logoutCountdown !== null && (
        <div className="px-6 py-2">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              密码修改成功！为了您的账户安全，将在{' '}
              <span className="font-bold text-orange-900">
                {logoutCountdown}
              </span>{' '}
              秒后自动退出登录。
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {/* 安全状态概览 */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>安全状态</span>
            </CardTitle>
            <CardDescription>
              保护您的账户安全，定期检查和更新安全设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 glass-card rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="premium-icon w-10 h-10 rounded-lg">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">{item.title}</p>
                      <p className="text-slate-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {item.status === 'pending' && (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    {item.copyable &&
                      item.description &&
                      item.description !== '未设置' &&
                      item.description !== '未获取' && (
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
              )
            })}
          </CardContent>
        </Card>

        {/* 编辑表单 - 根据编辑模式显示 */}
        {editMode === 'password' && (
          <Card className="glass-card border-white/30">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>修改密码</span>
              </CardTitle>
              <CardDescription>为了账户安全，建议定期更换密码</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    密码修改成功！请使用新密码登录。
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">当前密码</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="输入当前密码"
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
                  <Label htmlFor="newPassword">新密码</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="输入新密码"
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
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="再次输入新密码"
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
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 premium-gradient text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '修改中...' : '确认修改'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 更新昵称表单 */}
        {editMode === 'nickname' && (
          <Card className="glass-card border-white/30">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>更新昵称</span>
              </CardTitle>
              <CardDescription>修改您的显示昵称</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={nicknameForm.handleSubmit(onNicknameSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="输入新昵称"
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
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 premium-gradient text-white"
                  >
                    确认更新
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 绑定BSC地址表单 */}
        {editMode === 'bscAddress' && (
          <Card className="glass-card border-white/30">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span>绑定BSC地址</span>
              </CardTitle>
              <CardDescription>
                绑定您的BSC钱包地址用于提现和交易
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={bscAddressForm.handleSubmit(onBscAddressSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="bscAddress">BSC地址</Label>
                  <Input
                    id="bscAddress"
                    type="text"
                    placeholder="输入BSC地址 (0x...)"
                    {...bscAddressForm.register('bscAddress')}
                    className={
                      bscAddressForm.formState.errors.bscAddress
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {bscAddressForm.formState.errors.bscAddress && (
                    <p className="text-sm text-red-500">
                      {bscAddressForm.formState.errors.bscAddress.message}
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
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 premium-gradient text-white"
                  >
                    确认绑定
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 安全提示 */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle className="text-slate-800">安全提示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-slate-800 font-medium">定期更换密码</p>
                <p className="text-slate-600 text-sm">
                  建议每3-6个月更换一次登录密码
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-slate-800 font-medium">使用强密码</p>
                <p className="text-slate-600 text-sm">
                  密码应包含大小写字母、数字和特殊字符
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-slate-800 font-medium">保护账户信息</p>
                <p className="text-slate-600 text-sm">
                  不要在公共场所或不安全的网络环境下登录
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
