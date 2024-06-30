import express from 'express'
import { newProjectController, viewProjectController, viewAllProjectsController, updateProjectController, projectDeployController } from '../controllers/project.js'
import { isLoggedIn } from '../middleware/authentication.js'
const router = express.Router()

router.use(isLoggedIn)

router.post('/', newProjectController)
router.get('/:projectId', viewProjectController)
router.get('/', viewAllProjectsController)
router.put('/', updateProjectController)
router.post('/deploy', projectDeployController)

export default router