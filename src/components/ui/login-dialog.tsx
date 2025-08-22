'use client'

import { useState, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { useAuth } from '@/src/contexts/AuthContext'
import { useLanguage } from '@/src/contexts/language-context'

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('validation.email.invalid')),
    password: z.string().min(1, t('validation.password.required'))
  })

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess
}: LoginDialogProps) {
  const { t } = useLanguage()
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const emailId = useId()
  const passwordId = useId()

  const loginSchema = createLoginSchema(t)
  type LoginFormData = z.infer<typeof loginSchema>

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.loginFailed')
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('login.title') || '登录'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor={emailId}
              className="block text-sm font-medium text-gray-700"
            >
              {t('login.email.label')}
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder={t('login.email.placeholder')}
              {...form.register('email')}
              className="mt-2"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={passwordId}
              className="block text-sm font-medium text-gray-700"
            >
              {t('login.password.label')}
            </label>
            <Input
              id={passwordId}
              type="password"
              placeholder={t('login.password.placeholder')}
              {...form.register('password')}
              className="mt-2"
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isLoading}
            className="w-full"
          >
            {t('login.loginButton')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
