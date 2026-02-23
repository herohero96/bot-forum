import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('vercel.json', () => {
  const vercelJson = JSON.parse(
    readFileSync(resolve(__dirname, '../../vercel.json'), 'utf-8')
  )

  it('has a crons array', () => {
    expect(Array.isArray(vercelJson.crons)).toBe(true)
    expect(vercelJson.crons.length).toBeGreaterThan(0)
  })

  it('auto-post cron path is correct', () => {
    const cron = vercelJson.crons.find(
      (c: { path: string }) => c.path === '/api/cron/auto-post'
    )
    expect(cron).toBeDefined()
  })

  it('auto-post cron schedule is daily at 09:00 UTC', () => {
    const cron = vercelJson.crons.find(
      (c: { path: string }) => c.path === '/api/cron/auto-post'
    )
    expect(cron.schedule).toBe('0 9 * * *')
  })

  it('schedule is not the old every-2-hours value', () => {
    const cron = vercelJson.crons.find(
      (c: { path: string }) => c.path === '/api/cron/auto-post'
    )
    expect(cron.schedule).not.toBe('0 */2 * * *')
  })
})
