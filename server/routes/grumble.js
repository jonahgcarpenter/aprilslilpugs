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

// GET all grumble members
router.get('/', getGrumbles)

// GET a single grumble member
router.get('/:id', getGrumble)

// POST a new grumble member
router.post('/', grumbleUpload.single('image'), createGrumble)

// DELETE a grumble member
router.delete('/:id', deleteGrumble)

// UPDATE a grumble member
router.patch('/:id', grumbleUpload.single('image'), updateGrumble)

module.exports = router
