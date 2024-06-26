import express from 'express'
import { buildController, viewProjectController, viewAllProjectsController } from '../controllers/project.js'
import { isLoggedIn } from '../middleware/authentication.js'
const router = express.Router()

router.use(isLoggedIn)

router.post('/build', buildController)
router.get('/:projectId', viewProjectController)
router.get('/', viewAllProjectsController)

export default router