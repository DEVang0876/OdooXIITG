import Store from '../mockStore'
import { describe, it, expect } from 'vitest'

describe('mockStore seeded data', () => {
  it('contains default admin user with expected credentials', () => {
    Store.ensureDefaultData()
    const users = Store.getUsers()
    const admin = users.find(u => u.email === 'admin@example.com')
    expect(admin).toBeTruthy()
    expect(admin.password).toBe('admin123')
    expect(admin.role).toBe('admin')
  })
})
