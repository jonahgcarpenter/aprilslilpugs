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

// Grumble member routes with image handling

// GET all grumble members
router.get('/', getGrumbles)          // Get all grumble members

// GET a single grumble member
router.get('/:id', getGrumble)        // Get single grumble member

// POST a new grumble member
router.post('/', grumbleUpload.single('image'), createGrumble)    // Create new member

// DELETE a grumble member
router.delete('/:id', deleteGrumble)  // Remove member

// UPDATE a grumble member
router.patch('/:id', grumbleUpload.single('image'), updateGrumble) // Update member

module.exports = router
