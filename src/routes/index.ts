import { Router } from 'express'
import analyzeRoutes from './analyzeRoutes'

const router = Router()

router.use('/analyze', analyzeRoutes)

export default router
