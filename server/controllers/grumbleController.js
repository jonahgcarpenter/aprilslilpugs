const Grumble = require('../models/grumbleModel')
const { parseCentralTime } = require('../util/timezone')
const fs = require('fs').promises
const path = require('path')

// delete file helper
const deleteFile = async (filename) => {
    try {
        if (!filename || filename === 'grumble-placeholder.jpg') return;
        
        const absolutePath = path.join('public', 'uploads', 'grumble-images', filename);
        console.log('Attempting to delete:', absolutePath);
        
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
        console.log('Successfully deleted file:', absolutePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File not found at path:', error.path);
        } else {
            console.error('Error deleting file:', error);
        }
    }
};

// get all grumbles
const getGrumbles = async (req, res) => {
    try {
        const grumbles = await Grumble.find({}).sort({ createdAt: -1 });
        if (!grumbles) {
            return res.status(404).json({ error: 'No Grumble Members found' });
        }
        res.status(200).json(grumbles);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// get single grumble
const getGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }
        res.status(200).json(grumble);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// create new grumble
const createGrumble = async (req, res) => {
    try {
        const grumbleData = {
            ...req.body,
            profilePicture: req.file ? req.file.filename : 'grumble-placeholder.jpg',
            birthDate: parseCentralTime(req.body.birthDate) // Convert birthDate string to Date object
        }
        
        const grumble = await Grumble.create(grumbleData);
        res.status(200).json(grumble);
    } catch (error) {
        // Delete uploaded file if creation fails
        if (req.file) {
            await deleteFile(req.file.filename);
        }
        res.status(400).json({ error: error.message })
    }
}

// delete grumble
const deleteGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }

        // Delete profile picture
        await deleteFile(grumble.profilePicture)

        await grumble.deleteOne();
        
        res.status(200).json({ message: 'Grumble member deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(400).json({ error: error.message || 'Error deleting grumble member' })
    }
}

// update grumble
const updateGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }

        const updateData = { ...req.body }

        // Handle profile picture if uploaded
        if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
            await deleteFile(grumble.profilePicture);
            updateData.profilePicture = req.files.profilePicture[0].filename;
        }

        if (req.body.birthDate) {
            updateData.birthDate = parseCentralTime(req.body.birthDate);
        }

        const updatedGrumble = await Grumble.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedGrumble);
    } catch (error) {
        // Delete newly uploaded files if update fails
        if (req.files && req.files.profilePicture) {
            await deleteFile(req.files.profilePicture[0].filename);
        }
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
