import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRoutes from './routes/analyzeRoutes'
import testRoutes from './routes/testRoutes'
import { specs, swaggerUi } from './config/swagger'
import { logger } from './middleware/logger'

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(logger)

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))

// Health check endpoint for Docker 
app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// Routes
app.use('/', analyzeRoutes)
app.use('/test', testRoutes)

// Basic error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
