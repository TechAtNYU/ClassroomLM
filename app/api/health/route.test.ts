import { expect, test } from 'vitest'
import { GET } from './route'

test('Get 200 health check response', () => {
  expect(GET()).resolves.toHaveProperty("status",200)
})