'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthState, AuthContextType, User } from '@/src/types/auth'
import { AuthService } from '@/src/services/auth'

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // 恢复会话
    const token = AuthService.getToken()
    const userData = AuthService.getUser()

    if (token && userData) {
      dispatch({
        type: 'RESTORE_SESSION',
        payload: {
          user: {
            id: userData.userId,
            email: userData.email || '',
            nickname: userData.nickname,
            isAdmin: userData.isAdmin,
          },
          token,
        },
      })
    } else {
      dispatch({ type: 'LOGIN_FAILURE' })
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await AuthService.login({ email, password })
      
      const user: User = {
        id: response.userId,
        email,
        nickname: response.nickname,
        isAdmin: response.isAdmin,
      }

      // 保存到本地存储
      AuthService.setToken(response.token)
      AuthService.setUser({
        userId: response.userId,
        email,
        nickname: response.nickname,
        isAdmin: response.isAdmin,
      })

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.token },
      })
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    AuthService.removeToken()
    AuthService.removeUser()
    dispatch({ type: 'LOGOUT' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
