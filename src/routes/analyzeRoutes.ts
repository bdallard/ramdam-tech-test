import express, { Request, Response } from 'express'
import { searchImages } from '../services/unsplashService'
import { detectLabels } from '../services/visionService'
import { z, ZodError } from 'zod'

const router = express.Router()

// validation schema min 1 
const analyzeSchema = z.object({
  keyword: z.string().min(1),
  labels: z.array(z.string().min(1)).min(1),
})

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze images based on keyword and labels
 *     description: Searches for images on Unsplash and checks if they contain the specified labels using Google Vision API
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyzeRequest'
 *     responses:
 *       200:
 *         description: Successfully analyzed images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeResponse'
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.route('/analyze').post(function analyzeHandler(req: Request, res: Response) {
  const processRequest = async () => {
    try {
    
      // Validate the request body with zod : https://zod.dev/?id=basic-usage
      const validationResult = analyzeSchema.parse(req.body)
      const { keyword, labels } = validationResult

      // 1. Search images from Unsplash
      const photos = await searchImages(keyword)
    
      // 2. Process each image with Vision API
      const results = await Promise.all(
        photos.map(async (photo) => {
          try {
            // 3. Get labels for the image
            const detectedLabels = await detectLabels(photo.urls.regular)
            
            // 4. Check if all requested labels are present
            const normalizedRequestedLabels = labels.map((label: string) => 
              label.toLowerCase())
            
            const hasAllRequestedLabels = normalizedRequestedLabels.every(
              requestedLabel => detectedLabels.includes(requestedLabel),
            )
            
            if (hasAllRequestedLabels) {
              return {
                image_url: photo.urls.regular,
                labels: detectedLabels,
              }
            }
            
            return null
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error processing image ${photo.id}:`, error)
            return null
          }
        }),
      )
    
      // Filter out nulls and return the matches
      const matches = results.filter(result => result !== null)
    
      return res.status(200).json({
        keyword,
        matches,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in analyze endpoint:', error)
      return res.status(500).json({ 
        message : 'An error occured...',
        errors : error instanceof ZodError ? error.errors : undefined,
      })
    }
  }

  // Execute the async function
  processRequest()
})

export default router
