import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable global test APIs like describe, it, expect
    globals: true,
    
    // Environment
    environment: 'node',
    
    // Files to include in test runs
    include: ['src/**/*.test.ts'],
    
    // Files to exclude
    exclude: ['node_modules', 'dist'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/'],
    },
    
    // Set timeout (in ms)
    testTimeout: 10000,
    
    // Allow additional reporters
    reporters: ['default'],
    
    // Mock all .env files
    setupFiles: ['./src/tests/setup.ts'],
  },
})
