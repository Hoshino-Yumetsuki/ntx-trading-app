import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendVerificationCodeRequest,
  SendVerificationCodeResponse
} from '@/src/types/auth'
import { API_BASE_URL } from './config'

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '登录失败')
  }

  return response.json()
}

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '注册失败')
  }

  return response.json()
}

export async function sendVerificationCode(
  data: SendVerificationCodeRequest
): Promise<SendVerificationCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/send_verification_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '发送验证码失败')
  }

  return response.json()
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function removeToken(): void {
  localStorage.removeItem('auth_token')
}

export function setUser(user: any): void {
  localStorage.setItem('user_data', JSON.stringify(user))
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem('user_data')
  return userData ? JSON.parse(userData) : null
}

export function removeUser(): void {
  localStorage.removeItem('user_data')
}

// 为了向后兼容，保留AuthService对象
export const AuthService = {
  login,
  register,
  sendVerificationCode,
  setToken,
  getToken,
  removeToken,
  setUser,
  getUser,
  removeUser
}
