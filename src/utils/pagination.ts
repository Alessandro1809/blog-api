export interface PaginationResponse<T> {
  posts: T[]
  total: number
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function buildPaginationResponse<T>(
  posts: T[],
  total: number,
  limit: number,
  offset: number
): PaginationResponse<T> {
  return {
    posts,
    total,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  }
}
