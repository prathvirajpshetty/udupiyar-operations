const express = require('express');
const { ProductionData } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/production - Get all production data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, user } = req.query;
    
    const where = {};
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };
    if (user) where.user = user;

    const offset = (page - 1) * limit;
    
    const { count, rows } = await ProductionData.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
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
    console.error('Error fetching production data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch production data',
      message: error.message
    });
  }
});

// POST /api/production - Create new production data
router.post('/', async (req, res) => {
  try {
    const { date, productionFor, pouches, comment, user } = req.body;

    // Validation
    if (!date || !productionFor || !pouches || !user) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['date', 'productionFor', 'pouches', 'user']
      });
    }

    const productionData = await ProductionData.create({
      date,
      productionFor,
      pouches: parseInt(pouches),
      comment: comment || null,
      user,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: productionData,
      message: 'Production data created successfully'
    });
  } catch (error) {
    console.error('Error creating production data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create production data',
      message: error.message
    });
  }
});

// GET /api/production/:id - Get specific production data
router.get('/:id', async (req, res) => {
  try {
    const productionData = await ProductionData.findByPk(req.params.id);
    
    if (!productionData) {
      return res.status(404).json({
        success: false,
        error: 'Production data not found'
      });
    }

    res.json({
      success: true,
      data: productionData
    });
  } catch (error) {
    console.error('Error fetching production data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch production data',
      message: error.message
    });
  }
});

// PUT /api/production/:id - Update production data
router.put('/:id', async (req, res) => {
  try {
    const { date, productionFor, pouches, comment } = req.body;
    
    const productionData = await ProductionData.findByPk(req.params.id);
    
    if (!productionData) {
      return res.status(404).json({
        success: false,
        error: 'Production data not found'
      });
    }

    await productionData.update({
      date: date || productionData.date,
      productionFor: productionFor || productionData.productionFor,
      pouches: pouches !== undefined ? parseInt(pouches) : productionData.pouches,
      comment: comment !== undefined ? comment : productionData.comment
    });

    res.json({
      success: true,
      data: productionData,
      message: 'Production data updated successfully'
    });
  } catch (error) {
    console.error('Error updating production data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update production data',
      message: error.message
    });
  }
});

// DELETE /api/production/:id - Delete production data
router.delete('/:id', async (req, res) => {
  try {
    const productionData = await ProductionData.findByPk(req.params.id);
    
    if (!productionData) {
      return res.status(404).json({
        success: false,
        error: 'Production data not found'
      });
    }

    await productionData.destroy();

    res.json({
      success: true,
      message: 'Production data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting production data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete production data',
      message: error.message
    });
  }
});

module.exports = router;