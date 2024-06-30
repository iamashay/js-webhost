import express from 'express'
import { loginController, registerController, identityController, logoutController } from '../controllers/auth.js'
const router = express.Router()

router.post('/login', loginController)
router.post('/register', registerController)
router.get('/identity', identityController)
router.delete('/logout', logoutController)

export default router