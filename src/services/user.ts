import { UserInfo, TeamMember, WithdrawRequest } from '@/src/types/user'
import { AuthService } from './auth'

const API_BASE_URL = 'https://api.ntxdao.org/api'

export class UserService {
  private static getAuthHeaders() {
    const token = AuthService.getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  static async getUserInfo(): Promise<UserInfo> {
    const response = await fetch(`${API_BASE_URL}/user/get_user_info`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '获取用户信息失败')
    }

    return response.json()
  }

  static async getMyTeams(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/user/get_my_teams`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '获取团队信息失败')
    }

    return response.json()
  }

  static async withdrawUsdt(request: WithdrawRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/want_withdraw_usdt`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'USDT提现申请失败')
    }
  }

  static async withdrawNtx(request: WithdrawRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/want_withdraw_ntx`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'NTX提现申请失败')
    }
  }

  static async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/update_user_password_with_old`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '密码更新失败')
    }
  }
}
