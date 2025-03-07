/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import analyzeRoutes from '../../routes/analyzeRoutes'
import * as unsplashService from '../../services/unsplashService'
import * as visionService from '../../services/visionService'

// Mock the services
vi.mock('../../services/unsplashService', () => ({
  searchImages: vi.fn(),
}))
  
vi.mock('../../services/visionService', () => ({
  detectLabels: vi.fn(),
}))
  
describe('analyzeRoutes', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
    
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
      
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
  })
    
  it('should handle valid request correctly', async () => {
    // Setup a valid request that will pass Zod validation
    mockRequest = {
      body: {
        keyword: 'city',
        labels: [
          'sky',
          'building',
        ],
      },
    } as Request
      
    // Prepare mock data that will be returned by our service mocks
    const mockPhotos = [
      { id: '1', urls: { regular: 'http://example.com/image1.jpg' } },
    ]
      
    const mockLabels = ['label1', 'label2', 'label3'];
      
    // Setup mock implementations to return our test data
    (unsplashService.searchImages as any).mockResolvedValue(mockPhotos);
    (visionService.detectLabels as any).mockResolvedValue(mockLabels)
      
    // Get the actual route handler from the router
    const router = analyzeRoutes as any
    const routeHandler = router.stack[0].route.stack[0].handle
      
    // Call the handler directly with our mock request/response
    await routeHandler(mockRequest as Request, mockResponse as Response)
      
    // Wait for all promises to resolve
    await vi.waitFor(() => {
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })
      
    // Verify all expected behaviors
    expect(unsplashService.searchImages).toHaveBeenCalledWith('city')
    expect(visionService.detectLabels).toHaveBeenCalledWith('http://example.com/image1.jpg')
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      keyword: 'city',
      matches: expect.any(Array),
    }))
  })
    
  it('should handle validation errors', async () => {
    // Setup an invalid request that will fail Zod validation
    mockRequest = {
      body: {
        keyword: '',   // Invalid: empty string
        labels: [],    // Invalid: empty array
      },
    } as Request
      
    // Get route handler
    const router = analyzeRoutes as any
    const routeHandler = router.stack[0].route.stack[0].handle
      
    // Call route handler
    await routeHandler(mockRequest as Request, mockResponse as Response)
      
    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'An error occured...',
      errors: expect.anything(),
    }))
  })
})
