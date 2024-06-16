import express from 'express'
import { buildController, viewProjectController } from '../controllers/project.js'
import { isLoggedIn } from '../middleware/authentication.js'
const router = express.Router()

router.use(isLoggedIn)

router.post('/build', buildController)
router.get('/:projectId', viewProjectController)

export default router