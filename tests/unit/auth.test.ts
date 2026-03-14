import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Password Hashing', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should verify correct password', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'TestPassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword('WrongPassword', hash)
    expect(isValid).toBe(false)
  })
})
