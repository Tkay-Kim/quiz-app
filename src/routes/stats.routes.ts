import { Router } from 'express'
import { getOverview, getTagStats } from '../controllers/stats.controller'

const router = Router()

router.get('/overview', getOverview)
router.get('/tags', getTagStats)

export default router
