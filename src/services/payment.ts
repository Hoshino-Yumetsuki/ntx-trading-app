import type { CreateOrderResponse, Order } from '@/src/types/course'
import { API_BASE_URL } from '@/src/services/config'
import { AuthService } from '@/src/services/auth'

function getAuthHeaders() {
  const token = AuthService.getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export async function createOrder(
  packageId: number
): Promise<CreateOrderResponse> {
  const token = AuthService.getToken()
  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/payment/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ package_id: packageId })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || '创建订单失败')
  }

  return response.json()
}

export async function getMyOrders(): Promise<Order[]> {
  const token = AuthService.getToken()
  if (!token) {
    throw new Error('未登录')
  }

  const response = await fetch(`${API_BASE_URL}/payment/orders`, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || '获取订单失败')
  }

  return response.json()
}
