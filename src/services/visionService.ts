import { ImageAnnotatorClient } from '@google-cloud/vision'

// Create Vision API client
const visionClient = new ImageAnnotatorClient()

/**
 * Detect labels in an image using Google Vision API
 */
export async function detectLabels(imageUrl: string): Promise<string[]> {
  try {
    // eslint-disable-next-line no-console
    console.log(`Detecting labels for image: ${imageUrl}`)
    
    const [result] = await visionClient.labelDetection(imageUrl)
    const labels = result.labelAnnotations || []
    
    // Extract label descriptions and normalize them (lowercase)
    return labels
      .map(label => label.description?.toLowerCase() || '')
      .filter(Boolean)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in detectLabels:', error)
    throw error
  }
}

/**
 * Check if an image contains all the requested labels
 */
export async function hasAllLabels(imageUrl: string, requestedLabels: string[]): Promise<boolean> {
  try {
    const detectedLabels = await detectLabels(imageUrl)
    const normalizedRequestedLabels = requestedLabels.map(label => label.toLowerCase())
    
    // Check if all requested labels are present in detected labels
    return normalizedRequestedLabels.every(
      requestedLabel => detectedLabels.includes(requestedLabel),
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in hasAllLabels:', error)
    return false
  }
}
