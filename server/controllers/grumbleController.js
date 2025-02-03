const Grumble = require('../models/grumbleModel')
const { parseCentralTime } = require('../util/timezone')
const fs = require('fs').promises
const path = require('path')

/**
 * Helper Functions
 */

/**
 * Deletes an image file from the filesystem
 * Skips deletion if the image is a placeholder or doesn't exist
 * @param {string} filename - The filename of the image
 */
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

/**
 * Processes uploaded files and returns formatted paths
 * @param {Object} file - The file object from multer
 * @returns {string} Filename of the profile picture
 */
const processUploadedFiles = (file) => {
    return file ? file.filename : 'grumble-placeholder.jpg';
}

/**
 * Grumble Controller Functions
 * These functions manage the Grumble feature, which handles breeding dogs
 * including their profile information and multiple image galleries
 */

/**
 * GET all grumbles
 * Public access
 * Returns all grumbles sorted by most recent first
 */
const getGrumbles = async (req, res) => {
    try {
        const grumbles = await Grumble.find({}).sort({ createdAt: -1 });
        const response = grumbles.map(grumble => {
            const grumbleObj = grumble.toObject();
            grumbleObj.profilePicture = `/uploads/grumble-images/${grumbleObj.profilePicture}`;
            return grumbleObj;
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * GET single grumble
 * Public access
 * Returns detailed information for a specific grumble member
 */
const getGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }
        const response = grumble.toObject();
        response.profilePicture = `/uploads/grumble-images/${response.profilePicture}`;
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/**
 * POST new grumble
 * Private access
 * Creates a new grumble member with:
 * - Single profile picture (required, uses placeholder if none provided)
 * - Automatically handles file storage and cleanup on failure
 */
const createGrumble = async (req, res) => {
    try {
        const grumbleData = {
            ...req.body,
            profilePicture: req.file ? req.file.filename : 'grumble-placeholder.jpg',
            birthDate: parseCentralTime(req.body.birthDate) // Convert birthDate string to Date object
        }
        
        const grumble = await Grumble.create(grumbleData);
        const response = grumble.toObject();
        response.profilePicture = `/uploads/grumble-images/${response.profilePicture}`;
        
        res.status(200).json(response);
    } catch (error) {
        // Delete uploaded file if creation fails
        if (req.file) {
            await deleteFile(req.file.filename);
        }
        res.status(400).json({ error: error.message })
    }
}

/**
 * DELETE grumble
 * Private access
 * Removes a grumble member and:
 * - Deletes associated profile picture
 * - Cleans up all files from storage
 */
const deleteGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }

        // Delete profile picture
        await deleteFile(grumble.profilePicture)

        const deletedGrumble = await grumble.deleteOne()
        if (!deletedGrumble) {
            throw new Error('Failed to delete grumble member')
        }
        
        res.status(200).json({ message: 'Grumble member deleted successfully' })
    } catch (error) {
        console.error('Delete error:', error);
        res.status(400).json({ error: error.message || 'Error deleting grumble member' })
    }
}

/**
 * PATCH update grumble
 * Private access
 * Updates a grumble member with support for:
 * - Updating profile picture (handles old image deletion)
 * - Updating basic information
 * - Handles cleanup of files on failure
 */
const updateGrumble = async (req, res) => {
    const { id } = req.params

    try {
        const grumble = await Grumble.findById(id)
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' })
        }

        const updateData = { ...req.body }

        if (req.file) {
            await deleteFile(grumble.profilePicture);
            updateData.profilePicture = req.file.filename;
        }

        if (req.body.birthDate) {
            updateData.birthDate = parseCentralTime(req.body.birthDate);
        }

        const updatedGrumble = await Grumble.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        const response = updatedGrumble.toObject();
        response.profilePicture = `/uploads/grumble-images/${response.profilePicture}`;

        res.status(200).json(response);
    } catch (error) {
        // Delete newly uploaded file if update fails
        if (req.file) {
            await deleteFile(req.file.filename);
        }
        res.status(400).json({ error: error.message })
    }
}

// New controller function for updating profile picture
const updateProfilePicture = async (req, res) => {
    const { id } = req.params;

    try {
        const grumble = await Grumble.findById(id);
        if (!grumble) {
            return res.status(404).json({ error: 'No such grumble member found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Delete old profile picture
        await deleteFile(grumble.profilePicture);

        // Update with new profile picture
        const updatedGrumble = await Grumble.findByIdAndUpdate(
            id,
            { profilePicture: req.file.filename },
            { new: true }
        );

        const responseGrumble = updatedGrumble.toObject();
        responseGrumble.profilePicture = `/uploads/grumble-images/${responseGrumble.profilePicture}`;

        res.status(200).json(responseGrumble);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getGrumbles,
    getGrumble,
    createGrumble,
    deleteGrumble,
    updateGrumble,
    updateProfilePicture
}
