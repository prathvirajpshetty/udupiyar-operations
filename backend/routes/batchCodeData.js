// Batch Code Data API Routes
// CRUD operations for the consolidated BatchCodeData table

const express = require('express');
const { Op } = require('sequelize');
const { BatchCodeData } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new batch code data (without image)
router.post('/', auth, async (req, res) => {
  try {
    const {
      selectedDate,
      calculatedDates,
      user,
      description
    } = req.body;

    // Validate required fields
    if (!selectedDate || !calculatedDates) {
      return res.status(400).json({
        success: false,
        message: 'selectedDate and calculatedDates are required'
      });
    }

    const batchCodeData = await BatchCodeData.create({
      selectedDate,
      calculatedDates: typeof calculatedDates === 'string' 
        ? JSON.parse(calculatedDates) 
        : calculatedDates,
      user: user || req.user?.username || 'unknown',
      description,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Batch code data created successfully',
      data: batchCodeData
    });

  } catch (error) {
    console.error('Create batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get batch code data with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      date,
      page = 1,
      limit = 20,
      user,
      hasImage
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by date if provided
    if (date) {
      where.selectedDate = date;
    }

    // Filter by user if provided
    if (user) {
      where.user = user;
    }

    // Filter by image presence if specified
    if (hasImage !== undefined) {
      if (hasImage === 'true') {
        where.imageUrl = { [Op.not]: null };
      } else if (hasImage === 'false') {
        where.imageUrl = null;
      }
    }

    const { count, rows } = await BatchCodeData.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search batch code data
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchResults = await BatchCodeData.findAll({
      where: {
        [Op.or]: [
          { user: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { ocrText: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: searchResults,
      count: searchResults.length
    });

  } catch (error) {
    console.error('Search batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific batch code data by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const batchCodeData = await BatchCodeData.findByPk(id);

    if (!batchCodeData) {
      return res.status(404).json({
        success: false,
        message: 'Batch code data not found'
      });
    }

    res.json({
      success: true,
      data: batchCodeData
    });

  } catch (error) {
    console.error('Get batch code data by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update batch code data
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const batchCodeData = await BatchCodeData.findByPk(id);

    if (!batchCodeData) {
      return res.status(404).json({
        success: false,
        message: 'Batch code data not found'
      });
    }

    // Parse calculatedDates if it's a string
    if (updates.calculatedDates && typeof updates.calculatedDates === 'string') {
      updates.calculatedDates = JSON.parse(updates.calculatedDates);
    }

    await batchCodeData.update(updates);

    res.json({
      success: true,
      message: 'Batch code data updated successfully',
      data: batchCodeData
    });

  } catch (error) {
    console.error('Update batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete batch code data
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const batchCodeData = await BatchCodeData.findByPk(id);

    if (!batchCodeData) {
      return res.status(404).json({
        success: false,
        message: 'Batch code data not found'
      });
    }

    // TODO: If there's an image, also delete it from S3
    // This would require AWS S3 client setup

    await batchCodeData.destroy();

    res.json({
      success: true,
      message: 'Batch code data deleted successfully'
    });

  } catch (error) {
    console.error('Delete batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;