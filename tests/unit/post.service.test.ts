import { describe, it, expect, vi } from 'vitest'
import { PostService } from '../../src/services/post.service.js'

describe('PostService', () => {
    const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
    } as any

    it('should be defined', () => {
        const service = new PostService(mockDb)
        expect(service).toBeDefined()
    })

    it('should have getStats method', () => {
        const service = new PostService(mockDb)
        expect(service.getStats).toBeDefined()
    })
})
