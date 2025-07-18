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
