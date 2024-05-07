import express from 'express'
import { buildController } from '../controllers/project.js'
import { isLoggedIn } from '../middleware/authentication.js'
const router = express.Router()

router.use(isLoggedIn)

router.post('build', buildController)

export default router