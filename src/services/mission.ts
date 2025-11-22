import { AuthService } from './auth'
import { API_BASE_URL } from './config'

export interface Mission {
  id: number
  name: string
  description: string
  reward_amount: number
  task_type:
    | 'REGISTER'
    | 'BIND_EXCHANGE'
    | 'REFERRAL_COUNT'
    | 'TEAM_SIZE'
    | 'DAILY_LIVE'
    | 'DAILY_SHARE'
    | 'TRADE_ACTIVITY'
  condition_value: number
  is_daily: boolean
  is_active: boolean
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED'
  progress: number
}

export interface ClaimResponse {
  message: string
  reward: number
}

function getAuthHeaders() {
  const token = AuthService.getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export async function getMissionList(): Promise<Mission[]> {
  const response = await fetch(`${API_BASE_URL}/mission/list`, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || '获取任务列表失败')
  }

  return response.json()
}

export async function claimReward(taskId: number): Promise<ClaimResponse> {
  const response = await fetch(`${API_BASE_URL}/mission/claim`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ task_id: taskId })
  })

  if (!response.ok) {
    if (response.status === 401) {
      AuthService.removeToken()
      AuthService.removeUser()
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || '领取奖励失败')
  }

  return response.json()
}

export async function reportAction(
  action: 'daily_live' | 'daily_share' | 'bind_exchange'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/mission/action`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  })

  // According to requirements: "上报之后无论返回的是200还是400都不需要告诉用户，只需要再console中显示即可"
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Report action failed:', errorData)
    // We don't throw here to avoid disturbing the user flow, but usually for an API call we might want to know.
    // However, the requirement is specific about not telling the user.
  } else {
    console.log('Report action success:', action)
  }
}

export const MissionService = {
  getMissionList,
  claimReward,
  reportAction
}
