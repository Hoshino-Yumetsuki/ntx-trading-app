import { API_BASE_URL } from './config'

// 平台数据接口
export interface PlatformData {
  total_mined: number
  total_commission: number
  total_burned: number
  total_trading_volume: number
  platform_users: number
}

// 获取平台数据
export async function getPlatformData(): Promise<PlatformData> {
  const response = await fetch(`${API_BASE_URL}/mining/platform_data`)
  
  if (!response.ok) {
    throw new Error('获取平台数据失败')
  }
  
  return response.json()
}

// 格式化数字显示
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toFixed(2)
}

// 格式化货币显示
export function formatCurrency(num: number, currency: string = ''): string {
  const formatted = formatNumber(num)
  return currency ? `${formatted} ${currency}` : formatted
}

// MiningService对象，保持向后兼容
export const MiningService = {
  getPlatformData,
  formatNumber,
  formatCurrency
}
