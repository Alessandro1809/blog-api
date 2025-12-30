import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp, registerPlugins } from '../../src/server.js'

describe('Integration: Health Check', () => {
    let app: any

    beforeAll(async () => {
        app = buildApp()
        await registerPlugins(app)
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('GET /health should return 200 and status ok', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/health'
        })

        expect(response.statusCode).toBe(200)
        const payload = JSON.parse(response.payload)
        expect(payload.status).toBe('ok')
        expect(payload.timestamp).toBeDefined()
    })
})
