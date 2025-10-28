import { getAuthorsInfo } from './clerk.js'

interface Post {
  authorId: string
  [key: string]: any
}

export async function enrichPostsWithAuthors<T extends Post>(posts: T[]): Promise<(T & { author: any })[]> {
  if (posts.length === 0) return []
  
  const authorIds = posts.map(p => p.authorId)
  const authorsMap = await getAuthorsInfo(authorIds)
  
  return posts.map(post => ({
    ...post,
    author: authorsMap.get(post.authorId) || null
  }))
}

export async function enrichPostWithAuthor<T extends Post>(post: T): Promise<T & { author: any }> {
  const authorsMap = await getAuthorsInfo([post.authorId])
  
  return {
    ...post,
    author: authorsMap.get(post.authorId) || null
  }
}
