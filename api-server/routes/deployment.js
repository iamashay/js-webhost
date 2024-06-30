import express from 'express'
import {  viewAllDeploymentController, viewDeployment, viewDeploymentLog } from '../controllers/deployment.js'
import { isLoggedIn } from '../middleware/authentication.js'
const router = express.Router()

router.use(isLoggedIn)
router.get('/all/:projectId/', viewAllDeploymentController)
router.get('/:deploymentId', viewDeployment)
router.get('/:deploymentId/log', viewDeploymentLog)

export default router