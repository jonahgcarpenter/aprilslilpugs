const Grumble = require('../models/grumbleModel')

// Get all grumbles
const getGrumbles = async (req, res) => {
    try {
        const grumbles = await Grumble.find({}).sort({ createdAt: -1 })
        res.status(200).json(grumbles)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get a single grumble
const getGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }
        res.status(200).json(grumble)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Create a new grumble
const createGrumble = async (req, res) => {
    try {
        const imageUrl = req.file 
            ? `/api/images/uploads/grumble-images/${req.file.filename}` 
            : '/puppy-placeholder.jpg'
            
        const grumbleData = {
            ...req.body,
            image: imageUrl
        }
        
        const grumble = await Grumble.create(grumbleData)
        res.status(200).json(grumble)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Delete a grumble
const deleteGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findOneAndDelete({ _id: id })
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }
        res.status(200).json(grumble)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Update a grumble
const updateGrumble = async (req, res) => {
    const { id } = req.params

    try {
        let updateData = { ...req.body }
        if (req.file) {
            updateData.image = `/api/images/uploads/grumble-images/${req.file.filename}`
        }

        const grumble = await Grumble.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        )

        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }
        res.status(200).json(grumble)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    getGrumbles,
    getGrumble,
    createGrumble,
    deleteGrumble,
    updateGrumble
}
