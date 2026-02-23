import { describe, it, expect } from 'vitest'

describe('Vitest setup', () => {
  it('test framework is working', () => {
    expect(true).toBe(true)
  })

  it('can use basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toContain('ell')
  })
})
