import { it, describe, expect } from 'vitest'
import Auth from '../auth'
import Store from '../mockStore'

describe('Auth service', () => {
  it('logs in seeded admin with correct credentials', async () => {
    Store.ensureDefaultData()
    const res = await Auth.login('admin@example.com', 'admin123')
    expect(res).toHaveProperty('token')
    expect(res.user.email).toBe('admin@example.com')
    expect(res.user.role).toBe('admin')
  })

  it('throws on wrong password', async () => {
    await expect(Auth.login('admin@example.com', 'wrong')).rejects.toThrow()
  })

  it('accepts email with different case and surrounding spaces', async () => {
    const res = await Auth.login('  Admin@Example.com  ', 'admin123')
    expect(res.user.email).toBe('admin@example.com')
  })
})
