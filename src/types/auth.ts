export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  userId: number
  nickname: string
  isAdmin: boolean
}

export interface RegisterRequest {
  email: string
  nickname: string
  verification_code: string
  password: string
  invite_code?: string
}

export interface RegisterResponse {
  message: string
}

export interface SendVerificationCodeRequest {
  email: string
}

export interface SendVerificationCodeResponse {
  message: string
}

export interface User {
  id: number
  email: string
  nickname: string
  isAdmin: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}
