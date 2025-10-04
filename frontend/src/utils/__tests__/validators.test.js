import { describe, it, expect } from 'vitest'
import { isValidEmail } from '../validators'

describe('validators', ()=>{
  it('validates good and bad emails', ()=>{
    expect(isValidEmail('alice@example.com')).toBe(true)
    expect(isValidEmail('bad-email')).toBe(false)
  })
})
