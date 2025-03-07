import { createApi } from 'unsplash-js'

// Type definitions
export interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
  };
}

// Create Unsplash API client
const unsplashApi = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  fetch: fetch,
})

/**
 * Search images from Unsplash based on keyword
 */
export async function searchImages(keyword: string, perPage = 10): Promise<UnsplashPhoto[]> {
  try {
    //console.log(`Searching Unsplash for: ${keyword}`)
    
    const result = await unsplashApi.search.getPhotos({
      query: keyword,
      perPage,
    })

    if (result.errors) {
      //console.error('Unsplash API error:', result.errors[0])
      throw new Error(`Unsplash API error: ${result.errors[0]}`)
    }

    // Return the results
    return result.response.results.map(photo => ({
      id: photo.id,
      urls: {
        regular: photo.urls.regular,
      },
    }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in searchImages:', error)
    throw error
  }
}
