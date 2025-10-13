const express = require('express');
const { PrintingData } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/printing - Get all printing data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, user } = req.query;
    
    const where = {};
    if (startDate) where.selectedDate = { ...where.selectedDate, [Op.gte]: startDate };
    if (endDate) where.selectedDate = { ...where.selectedDate, [Op.lte]: endDate };
    if (user) where.user = user;

    const offset = (page - 1) * limit;
    
    const { count, rows } = await PrintingData.findAndCountAll({
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
    console.error('Error fetching printing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch printing data',
      message: error.message
    });
  }
});

// POST /api/printing - Create new printing data
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

    const printingData = await PrintingData.create({
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
      data: printingData,
      message: 'Printing data created successfully'
    });
  } catch (error) {
    console.error('Error creating printing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create printing data',
      message: error.message
    });
  }
});

// GET /api/printing/:id - Get specific printing data
router.get('/:id', async (req, res) => {
  try {
    const printingData = await PrintingData.findByPk(req.params.id);
    
    if (!printingData) {
      return res.status(404).json({
        success: false,
        error: 'Printing data not found'
      });
    }

    res.json({
      success: true,
      data: printingData
    });
  } catch (error) {
    console.error('Error fetching printing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch printing data',
      message: error.message
    });
  }
});

// PUT /api/printing/:id - Update printing data
router.put('/:id', async (req, res) => {
  try {
    const { selectedDate, calculatedDates, imageUrl, imagePath, ocrText } = req.body;
    
    const printingData = await PrintingData.findByPk(req.params.id);
    
    if (!printingData) {
      return res.status(404).json({
        success: false,
        error: 'Printing data not found'
      });
    }

    await printingData.update({
      selectedDate: selectedDate || printingData.selectedDate,
      calculatedDates: calculatedDates !== undefined ? calculatedDates : printingData.calculatedDates,
      imageUrl: imageUrl !== undefined ? imageUrl : printingData.imageUrl,
      imagePath: imagePath !== undefined ? imagePath : printingData.imagePath,
      ocrText: ocrText !== undefined ? ocrText : printingData.ocrText
    });

    res.json({
      success: true,
      data: printingData,
      message: 'Printing data updated successfully'
    });
  } catch (error) {
    console.error('Error updating printing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update printing data',
      message: error.message
    });
  }
});

// DELETE /api/printing/:id - Delete printing data
router.delete('/:id', async (req, res) => {
  try {
    const printingData = await PrintingData.findByPk(req.params.id);
    
    if (!printingData) {
      return res.status(404).json({
        success: false,
        error: 'Printing data not found'
      });
    }

    await printingData.destroy();

    res.json({
      success: true,
      message: 'Printing data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting printing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete printing data',
      message: error.message
    });
  }
});

// POST /api/printing/calculate-dates - Calculate printing dates
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