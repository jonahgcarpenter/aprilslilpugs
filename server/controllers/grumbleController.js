const Grumble = require('../models/grumbleModel')

/**
 * Grumble Controller Functions
 * These functions manage the Grumble feature, which handles special breeding dogs
 */

// Retrieves all grumble members, sorted by most recent first
const getGrumbles = async (req, res) => {
    try {
        const grumbles = await Grumble.find({}).sort({ createdAt: -1 })
        res.status(200).json(grumbles)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Fetches a single grumble member by ID
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

// Creates a new grumble member with optional image upload
// Uses default placeholder image if no image is provided
const createGrumble = async (req, res) => {
    try {
        // Store clean path without /api/images prefix
        const imageUrl = req.file 
            ? `/uploads/grumble-images/${req.file.filename}` 
            : '/uploads/grumble-images/grumble-placeholder.jpg';
            
        const grumbleData = {
            ...req.body,
            image: imageUrl,  // This will store the correct path format
            birthDate: new Date(req.body.birthDate) // Convert birthDate string to Date object
        }
        
        const grumble = await Grumble.create(grumbleData)
        res.status(200).json(grumble)
    } catch (error) {
        // More detailed error handling
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Invalid data provided', details: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
}

// Removes a grumble member from the database
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

// Updates grumble member information including optional image
const updateGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const updateData = {
            ...req.body,
            birthDate: new Date(req.body.birthDate)
        };

        if (req.file) {
            // Store clean path without /api/images prefix
            updateData.image = `/uploads/grumble-images/${req.file.filename}`;
        }

        const grumble = await Grumble.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true, runValidators: true }  // Added runValidators for schema validation
        );

        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' });
        }

        res.status(200).json(grumble);
    } catch (error) {
        // More detailed error handling
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Invalid data provided', details: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = {
    getGrumbles,
    getGrumble,
    createGrumble,
    deleteGrumble,
    updateGrumble
}
