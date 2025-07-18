import { LoginRequest, LoginResponse } from '@/src/types/auth'

const API_BASE_URL = 'https://api.ntxdao.org/api'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '登录失败')
    }

    return response.json()
  }

  static setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  static removeToken(): void {
    localStorage.removeItem('auth_token')
  }

  static setUser(user: any): void {
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  static getUser(): any | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  static removeUser(): void {
    localStorage.removeItem('user_data')
  }
}
