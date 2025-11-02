import type {
  UserInfo,
  WithdrawRequest,
  WithdrawalRecord,
  CommissionRecord,
  CommunityResponse
} from '@/src/types/user'
import { AuthService } from './auth'
import { API_BASE_URL } from './config'

function getAuthHeaders() {
  const token = AuthService.getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export async function getUserInfo(): Promise<UserInfo> {
  const response = await fetch(`${API_BASE_URL}/user/get_user_info`, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || '获取用户信息失败')
  }

  return response.json()
}

export async function getMyTeams(): Promise<CommunityResponse> {
  const response = await fetch(`${API_BASE_URL}/user/my_teams`, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || '获取团队信息失败')
  }

  return response.json()
}

export async function withdrawUsdt(request: WithdrawRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/want_withdraw_usdt`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || 'USDT提现申请失败')
  }
}

export async function withdrawNtx(request: WithdrawRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/want_withdraw_ntx`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || 'NTX提现申请失败')
  }
}

export async function updatePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/edit_password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || '密码更新失败')
  }
}

export async function updateNickname(nickname: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/nickname`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      nickname
    })
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || '昵称更新失败')
  }
}

export async function bindBscAddress(bscAddress: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/bind_bsc_address`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bscAddress })
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json()
    throw new Error(errorData.error || 'BSC地址绑定失败')
  }
}

export async function getWithdrawalRecords(): Promise<WithdrawalRecord[]> {
  const token = AuthService.getToken()
  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/user/withdrawal_records`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || '获取提现记录失败')
  }

  return response.json()
}

export async function getCommissionRecords(): Promise<CommissionRecord[]> {
  const token = AuthService.getToken()
  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/user/commission_records`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || '获取佣金记录失败')
  }

  return response.json()
}

export const UserService = {
  getUserInfo,
  getMyTeams,
  withdrawUsdt,
  withdrawNtx,
  updatePassword,
  updateNickname,
  bindBscAddress,
  getWithdrawalRecords,
  getCommissionRecords
}
