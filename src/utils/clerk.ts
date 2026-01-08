import { clerkClient } from '@clerk/clerk-sdk-node'

export interface AuthorInfo {
  id: string
  name: string
  avatar: string | null
  username: string | null
}

export async function getAuthorInfo(userId: string): Promise<AuthorInfo> {
  try {
    const user = await clerkClient.users.getUser(userId)
    
    return {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
      avatar: user.imageUrl || null,
      username: user.username || null
    }
  } catch (error: any) {
    // Only log if it's not a 404 (user not found is expected for users in different Clerk apps)
    if (error?.status !== 404) {
      console.error(`Error fetching user ${userId} from Clerk:`, error)
    }
    
    // Return default author when user is not found
    return {
      id: userId,
      name: 'NOUS Co-Founder',
      avatar: null,
      username: null
    }
  }
}

export async function getAuthorsInfo(userIds: string[]): Promise<Map<string, AuthorInfo>> {
  const authorsMap = new Map<string, AuthorInfo>()
  
  const uniqueUserIds = [...new Set(userIds)]
  
  const results = await Promise.allSettled(
    uniqueUserIds.map(id => getAuthorInfo(id))
  )
  
  results.forEach((result, index) => {
    const userId = uniqueUserIds[index]
    if (result.status === 'fulfilled' && userId) {
      authorsMap.set(userId, result.value)
    }
  })
  
  return authorsMap
}
