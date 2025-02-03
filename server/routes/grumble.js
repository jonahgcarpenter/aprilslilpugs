const express = require('express')
const router = express.Router()
const { 
    getGrumbles, 
    getGrumble, 
    createGrumble, 
    deleteGrumble, 
    updateGrumble
} = require('../controllers/grumbleController')
const { grumbleUpload } = require('../middleware/multerConfig')
const requireAuth = require('../middleware/auth')

// Public routes
router.get('/', getGrumbles)
router.get('/:id', getGrumble)

// Protected routes - require authentication
router.post('/', requireAuth, grumbleUpload.fields([
    { name: 'profilePicture', maxCount: 1 }
]), createGrumble)
router.patch('/:id', requireAuth, grumbleUpload.fields([
    { name: 'profilePicture', maxCount: 1 }
]), updateGrumble)
router.delete('/:id', requireAuth, deleteGrumble)

module.exports = router
