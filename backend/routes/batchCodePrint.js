const express = require('express');
const { BatchCodeData } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/batch-code-print - Get all batch code print data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, user } = req.query;
    
    const where = {};
    if (startDate) where.selectedDate = { ...where.selectedDate, [Op.gte]: startDate };
    if (endDate) where.selectedDate = { ...where.selectedDate, [Op.lte]: endDate };
    if (user) where.user = user;

    const offset = (page - 1) * limit;
    
    const { count, rows } = await BatchCodeData.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['selectedDate', 'DESC'], ['createdAt', 'DESC']]
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
    console.error('Error fetching batch code print data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch code print data',
      message: error.message
    });
  }
});

// POST /api/batch-code-print - Create new batch code print data
router.post('/', async (req, res) => {
  try {
    const { selectedDate, calculatedDates, imageUrl, imagePath, ocrText, user } = req.body;

    // Validation
    if (!selectedDate || !user) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['selectedDate', 'user']
      });
    }

    const batchCodeData = await BatchCodeData.create({
      selectedDate,
      calculatedDates: calculatedDates || null,
      imageUrl: imageUrl || null,
      imagePath: imagePath || null,
      ocrText: ocrText || null,
      user,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: batchCodeData,
      message: 'Batch code data created successfully'
    });
  } catch (error) {
    console.error('Error creating batch code print data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create batch code print data',
      message: error.message
    });
  }
});

// GET /api/batch-code-print/:id - Get specific batch code print data
router.get('/:id', async (req, res) => {
  try {
    const batchCodeData = await BatchCodeData.findByPk(req.params.id);

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
    console.error('Error fetching batch code print data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch code print data',
      message: error.message
    });
  }
});

// PUT /api/batch-code-print/:id - Update batch code print data
router.put('/:id', async (req, res) => {
  try {
    const { selectedDate, calculatedDates, imageUrl, imagePath, ocrText } = req.body;
    
    const batchCodeData = await BatchCodeData.findByPk(req.params.id);
    
    if (!batchCodeData) {
      return res.status(404).json({
        success: false,
        error: 'Batch code data not found'
      });
    }

    await batchCodeData.update({
      selectedDate: selectedDate || batchCodeData.selectedDate,
      calculatedDates: calculatedDates !== undefined ? calculatedDates : batchCodeData.calculatedDates,
      imageUrl: imageUrl !== undefined ? imageUrl : batchCodeData.imageUrl,
      imagePath: imagePath !== undefined ? imagePath : batchCodeData.imagePath,
      ocrText: ocrText !== undefined ? ocrText : batchCodeData.ocrText
    });

    res.json({
      success: true,
      data: batchCodeData,
      message: 'Batch code data updated successfully'
    });
  } catch (error) {
    console.error('Error updating batch code print data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update batch code print data',
      message: error.message
    });
  }
});

// DELETE /api/batch-code-print/:id - Delete batch code data
router.delete('/:id', async (req, res) => {
  try {
    const batchCodeData = await BatchCodeData.findByPk(req.params.id);
    
    if (!batchCodeData) {
      return res.status(404).json({
        success: false,
        error: 'Batch code data not found'
      });
    }

    await batchCodeData.destroy();

    res.json({
      success: true,
      message: 'Batch code data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting batch code print data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete batch code print data',
      message: error.message
    });
  }
});

// POST /api/batch-code-print/calculate-dates - Calculate batch code print dates
router.post('/calculate-dates', (req, res) => {
  try {
    const { selectedDate } = req.body;
    
    if (!selectedDate) {
      return res.status(400).json({
        success: false,
        error: 'selectedDate is required'
      });
    }

    // Implement your date calculation logic here
    // This is similar to what you have in the frontend
    const inputDate = new Date(selectedDate);
    
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    // Add your calculation logic here
    const calculatedDates = {
      selectedDate,
      // Add your calculated date fields here
      // Example: printingDate, deliveryDate, etc.
    };

    res.json({
      success: true,
      data: calculatedDates,
      message: 'Dates calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating dates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate dates',
      message: error.message
    });
  }
});

module.exports = router;