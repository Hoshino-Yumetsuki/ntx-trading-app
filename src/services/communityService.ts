import { API_BASE_URL } from './config'
import type { Community } from '@/src/types/community'

export async function getAllCommunities(): Promise<Community[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/all`)

    if (!response.ok) {
      throw new Error(`Error fetching communities: ${response.status}`)
    }

    const data = await response.json()
    return data.communities || []
  } catch (error) {
    console.error('Failed to fetch communities:', error)
    throw error
  }
}

export function extractUrlFromContent(content: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)

  return matches && matches.length > 0 ? matches[0] : ''
}
