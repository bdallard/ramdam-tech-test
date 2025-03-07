import express, { Request, Response } from 'express'
import { searchImages } from '../services/unsplashService'
import { detectLabels } from '../services/visionService'
import { z } from 'zod'

const router = express.Router()

//TODO: apply zod for valite pipeline : https://zod.dev/?id=pipe
const unplashSchema = z.object({
  keyword: z.string().min(1),
  limit: z.string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1)),
})

// Test route for Unsplash API
/**
 * @swagger
 * /test/unsplash:
 *   get:
 *     summary: Test the Unsplash API
 *     description: Retrieves images from Unsplash based on a keyword
 *     tags: [Testing]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search for
 *         example: city
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of images to retrieve
 *         example: 5
 *     responses:
 *       200:
 *         description: Successfully retrieved images
 *       500:
 *         description: Server error
 */
router.route('/unsplash').get(function testUnsplashHandler(req: Request, res: Response) {
  const processRequest = async () => {
    try {
      const validationUnsplash = unplashSchema.parse(req.query)
      
      // Get the test keyword from query parameter or use a default
      //const keyword = req.query.keyword as string || 'city';
      //const limit = parseInt(req.query.limit as string || '5', 10);
      const {keyword, limit} = validationUnsplash 

      //console.log(`Testing Unsplash API with keyword: "${keyword}", limit: ${limit}`)
      
      const photos = await searchImages(keyword, limit)
      
      return res.status(200).json({
        success: true,
        keyword,
        count: photos.length,
        photos,
      })
    } catch (error) {
      //console.error('Error testing Unsplash API:', error)
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      })
    }
  }

  // Execute the async function
  processRequest()
})

// Test route for Google Vision API
/**
 * @swagger
 * /test/vision:
 *   get:
 *     summary: Test the Google Vision API
 *     description: Detects labels in an image using Google Vision API
 *     tags: [Testing]
 *     parameters:
 *       - in: query
 *         name: imageUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: URL of the image to analyze
 *         example: https://images.unsplash.com/photo-123456
 *     responses:
 *       200:
 *         description: Successfully detected labels
 *       400:
 *         description: Missing image URL
 *       500:
 *         description: Server error
 */
router.route('/vision').get(function testVisionHandler(req: Request, res: Response) {
  const processRequest = async () => {
    try {
      // Get image URL from query parameter
      const imageUrl = req.query.imageUrl as string
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Missing required query parameter: imageUrl',
        })
      }
      
      //console.log(`Testing Google Vision API with image URL: "${imageUrl}"`)
      
      const labels = await detectLabels(imageUrl)
      
      return res.status(200).json({
        success: true,
        imageUrl,
        labelsCount: labels.length,
        labels,
      })
    } catch (error) {
      //console.error('Error testing Google Vision API:', error)
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      })
    }
  }

  // Execute the async function
  processRequest()
})

/**
 * @swagger
 * /test/combined-test:
 *   get:
 *     summary: Test both Unsplash and Vision APIs
 *     description: Searches for images and checks if they contain a specific label
 *     tags: [Testing]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search for
 *         example: city
 *       - in: query
 *         name: label
 *         schema:
 *           type: string
 *         description: Label to look for in the images
 *         example: building
 *     responses:
 *       200:
 *         description: Successfully tested both APIs
 *       404:
 *         description: No images found for the keyword
 *       500:
 *         description: Server error
 */
router.route('/combined-test').get(function testCombinedHandler(req: Request, res: Response) {
  const processRequest = async () => {
    try {
      // Get parameters from query
      const keyword = req.query.keyword as string || 'city'
      const searchLabel = req.query.label as string || 'building'
      
      //console.log(`Testing combined APIs with keyword: "${keyword}", searching for label: "${searchLabel}"`)
      
      // Step 1: Get images from Unsplash
      const photos = await searchImages(keyword, 3) // Limit to 3 for quicker testing
      
      if (photos.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No images found for keyword: ${keyword}`,
        })
      }
      
      // Step 2: Test each image with Vision API
      const results = await Promise.all(
        photos.map(async (photo) => {
          try {
            const imageUrl = photo.urls.regular
            const detectedLabels = await detectLabels(imageUrl)
            
            // Check if the search label is found
            const hasSearchLabel = detectedLabels.includes(searchLabel.toLowerCase())
            
            return {
              imageUrl,
              detected: hasSearchLabel,
              allLabels: detectedLabels,
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error processing image:', error)
            return {
              imageUrl: photo.urls.regular,
              error: error instanceof Error ? error.message : 'Unknown error',
              detected: false,
              allLabels: [],
            }
          }
        }),
      )
      
      return res.status(200).json({
        success: true,
        keyword,
        searchLabel,
        imagesTested: results.length,
        imagesWithLabel: results.filter(result => result.detected).length,
        results,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in combined test:', error)
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      })
    }
  }

  // Execute the async function
  processRequest()
})

export default router
