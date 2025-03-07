// src/tests/setup.ts
import { vi } from 'vitest'

// Set required environment variables for tests
process.env.UNSPLASH_ACCESS_KEY = 'test-key'
process.env.NODE_ENV = 'test'

// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks()
})
