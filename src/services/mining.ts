import { API_BASE_URL } from './config'
import { AuthService } from '@/src/services/auth'

// 平台数据接口
export interface PlatformData {
  total_mined: number
  total_commission: number
  total_burned: number
  total_trading_volume: number
  platform_users: number
}

// 平台日数据接口
export interface DailyPlatformData {
  mining_output: number
  burned: number
  commission: number
  trading_volume: number
  miners: number
}

// 用户总数据接口
export interface UserData {
  total_mining: number
  total_trading_cost: number
}

// 用户每日数据接口
export interface DailyUserData {
  mining_output: number
  total_trading_cost: number
}

// 挖矿排行榜项目接口
export interface LeaderboardItem {
  nickname: string
  email_masked: string
  mining_amount: number
}

export interface Exchange {
  id: number
  name: string
  logo_url: string
  mining_efficiency: number
  cex_url: string
}

// 用户绑定的交易所（实际API返回格式）
export interface UserExchange {
  id: number
  name: string
  logo_url: string
  mining_efficiency: number
  cex_url: string
}

export interface BindExchangeRequest {
  exchange_id: number
  exchange_uid: string
}

// 获取平台数据
export async function getPlatformData(): Promise<PlatformData> {
  const response = await fetch(`${API_BASE_URL}/mining/platform_data`)

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取平台数据失败')
  }

  return response.json()
}

// 获取平台日数据
export async function getDailyPlatformData(
  date?: string
): Promise<DailyPlatformData> {
  // 如果没有提供日期，使用今天的日期
  const targetDate = date || new Date().toISOString().split('T')[0]
  const response = await fetch(
    `${API_BASE_URL}/mining/daily_platform_data?date=${targetDate}`
  )

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取平台日数据失败')
  }

  return response.json()
}

// 获取用户总数据
export async function getUserData(token: string): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/mining/user_data`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取用户数据失败')
  }

  return response.json()
}

// 获取用户每日数据
export async function getDailyUserData(
  token: string,
  date?: string
): Promise<DailyUserData> {
  const url = new URL(`${API_BASE_URL}/mining/daily_user_data`)
  if (date) {
    url.searchParams.append('date', date)
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取用户每日数据失败')
  }

  return response.json()
}

// 获取挖矿排行榜
export async function getMiningLeaderboard(): Promise<LeaderboardItem[]> {
  const response = await fetch(`${API_BASE_URL}/mining/mining_leaderboard`)

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取挖矿排行榜失败')
  }

  return response.json()
}

// 格式化数字显示
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || Number.isNaN(num)) {
    return '0.00'
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

export function formatCurrency(
  num: number | undefined | null,
  currency = 'USDT'
): string {
  if (num === undefined || num === null || Number.isNaN(num)) {
    return '0.00'
  }
  return `${formatNumber(num)} ${currency}`
}

// 获取交易所列表
export async function getExchanges(): Promise<Exchange[]> {
  const response = await fetch(`${API_BASE_URL}/mining/get_exchanges`)

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取交易所列表失败')
  }

  return response.json()
}

// 绑定交易所
export async function bindExchange(
  token: string,
  data: BindExchangeRequest
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/mining/bind_exchange`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('绑定交易所失败')
  }

  return response.json()
}

// 解绑交易所
export async function unbindExchange(
  token: string,
  exchangeId: number
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/mining/bind_exchange`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      exchange_id: exchangeId,
      exchange_uid: null
    })
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('解绑交易所失败')
  }

  return response.json()
}

// 获取用户绑定的交易所
export async function getUserExchanges(token: string): Promise<UserExchange[]> {
  const response = await fetch(`${API_BASE_URL}/mining/user_exchanges`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    throw new Error('获取用户交易所失败')
  }

  return response.json()
}

// MiningService对象，保持向后兼容
export const MiningService = {
  getPlatformData,
  getDailyPlatformData,
  getUserData,
  getDailyUserData,
  getMiningLeaderboard,
  getExchanges,
  getUserExchanges,
  bindExchange,
  unbindExchange,
  formatNumber,
  formatCurrency
}
