export interface UserInfo {
  id: number
  nickname: string
  email: string
  myInviteCode: string
  invitedBy: string
  exp: number
  role: string
  usdtBalance: number
  ntxBalance: number
  bscAddress: string
  gntxBalance: number
  invitedUserCount: number
}

export interface TeamMember {
  id?: number
  email: string
  nickname: string
  joined_at: string
}

export interface WithdrawRequest {
  amount: number
  toAddress: string
  currency?: string
  status?: string
  createdAt?: string
  id?: number
}

export interface WithdrawalRecord {
  id: number
  currency: string
  amount: number
  to_address: string
  status: string
  created_at: string
  confirmed_at?: string
}

export interface CommissionRecord {
  id: number
  invitee_email: string
  invitee_nickname: string
  amount: number
  created_at: string
}
