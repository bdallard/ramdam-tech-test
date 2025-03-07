/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import testRoutes from '../../routes/testRoutes'
import * as unsplashService from '../../services/unsplashService'
import * as visionService from '../../services/visionService'

// Mock the services
vi.mock('../../services/unsplashService', () => ({
  searchImages: vi.fn(),
}))
  
vi.mock('../../services/visionService', () => ({
  detectLabels: vi.fn(),
}))
  
describe('testRoutes', () => {
  describe('GET /test/unsplash', () => {
    it('should return photos when valid parameters are provided', async () => {
      // Setup mock request and response
      const mockRequest = {
        query: {
          keyword: 'city',
          limit: '5',
        },
      } as unknown as Request
        
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
        
      // Mock data
      const mockPhotos = [ 
        { id: '1', urls: { regular: 'http://example.com/image1.jpg' } },
        { id: '2', urls: { regular: 'http://example.com/image2.jpg' } },
      ];
        
      // Setup mock
      (unsplashService.searchImages as any).mockResolvedValue(mockPhotos)
        
      // Get route handler
      const router = testRoutes as any
      const routeHandler = router.stack.find((layer: any) => 
        layer.route && layer.route.path === '/unsplash').route.stack[0].handle
        
      // Call route handler
      await routeHandler(mockRequest, mockResponse)
        
      // Assertions
      expect(unsplashService.searchImages).toHaveBeenCalledWith('city', 5)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        keyword: 'city',
        count: 2,
        photos: mockPhotos,
      }))
    })
  })
    
  describe('GET /test/vision', () => {
    it('should return labels when a valid image URL is provided', async () => {
      // Setup mock request and response
      const mockRequest = {
        query: {
          imageUrl: 'http://example.com/image.jpg',
        },
      } as unknown as Request
        
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
        
      // Mock labels
      const mockLabels = ['sky', 'building', 'person'];
        
      // Setup mock
      (visionService.detectLabels as any).mockResolvedValue(mockLabels)
        
      // Get route handler
      const router = testRoutes as any
      const routeHandler = router.stack.find((layer: any) => 
        layer.route && layer.route.path === '/vision').route.stack[0].handle
        
      // Call route handler
      await routeHandler(mockRequest, mockResponse)
        
      // Assertions
      expect(visionService.detectLabels).toHaveBeenCalledWith('http://example.com/image.jpg')
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        imageUrl: 'http://example.com/image.jpg',
        labelsCount: 3,
        labels: mockLabels,
      }))
    })
      
    it('should return 400 when image URL is missing', async () => {
      // Setup mock request and response
      const mockRequest = {
        query: {},
      } as unknown as Request
        
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response
        
      // Get route handler
      const router = testRoutes as any
      const routeHandler = router.stack.find((layer: any) => 
        layer.route && layer.route.path === '/vision').route.stack[0].handle
        
      // Call route handler
      await routeHandler(mockRequest, mockResponse)
        
      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Missing required query parameter: imageUrl',
      }))
    })
  })
})
  
