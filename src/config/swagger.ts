import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Analyzer API',
      version: '1.0.0',
      description: 'API for analyzing images using Unsplash and Google Vision',
      contact: {
        name: 'API Doc',
        email: 'email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        AnalyzeRequest: {
          type: 'object',
          required: ['keyword', 'labels'],
          properties: {
            keyword: {
              type: 'string',
              description: 'The keyword to search for images',
              example: 'city',
            },
            labels: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Labels to look for in the images',
              example: ['sky', 'building'],
            },
          },
        },
        AnalyzeResponse: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'The keyword that was searched',
              example: 'city',
            },
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  image_url: {
                    type: 'string',
                    description: 'URL of the matching image',
                    example: 'https://images.unsplash.com/photo-123456',
                  },
                  labels: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Labels detected in the image',
                    example: ['sky', 'building', 'street', 'people'],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
}

const specs = swaggerJsdoc(options)

export { specs, swaggerUi }
