import { clerkClient } from '@clerk/clerk-sdk-node'

export interface AuthorInfo {
  id: string
  name: string
  avatar: string | null
  username: string | null
}

/**
 * Obtiene información pública del autor desde Clerk
 */
export async function getAuthorInfo(userId: string): Promise<AuthorInfo | null> {
  try {
    const user = await clerkClient.users.getUser(userId)
    
    return {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
      avatar: user.imageUrl || null,
      username: user.username || null
    }
  } catch (error) {
    console.error(`Error fetching user ${userId} from Clerk:`, error)
    return null
  }
}

/**
 * Obtiene información de múltiples autores desde Clerk
 */
export async function getAuthorsInfo(userIds: string[]): Promise<Map<string, AuthorInfo>> {
  const authorsMap = new Map<string, AuthorInfo>()
  
  // Obtener usuarios únicos
  const uniqueUserIds = [...new Set(userIds)]
  
  // Fetch en paralelo
  const results = await Promise.allSettled(
    uniqueUserIds.map(id => getAuthorInfo(id))
  )
  
  results.forEach((result, index) => {
    const userId = uniqueUserIds[index]
    if (result.status === 'fulfilled' && result.value && userId) {
      authorsMap.set(userId, result.value)
    }
  })
  
  return authorsMap
}
