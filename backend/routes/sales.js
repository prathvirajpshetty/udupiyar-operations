const express = require('express');
const { SalesData, sequelize } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/sales - Get all sales data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, user, regularSale } = req.query;
    
    const where = {};
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };
    if (user) where.user = user;
    if (regularSale !== undefined) where.regularSale = regularSale === 'true';

    const offset = (page - 1) * limit;
    
    const { count, rows } = await SalesData.findAndCountAll({
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
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales data',
      message: error.message
    });
  }
});

// POST /api/sales - Create new sales data
router.post('/', async (req, res) => {
  try {
    const { date, sold, exchange, return: returnAmount, amount, regularSale, comment, user } = req.body;

    // Validation
    if (!date || sold === undefined || exchange === undefined || returnAmount === undefined || amount === undefined || !user) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['date', 'sold', 'exchange', 'return', 'amount', 'user']
      });
    }

    const salesData = await SalesData.create({
      date,
      sold: parseFloat(sold),
      exchange: parseFloat(exchange),
      return: parseFloat(returnAmount),
      amount: parseFloat(amount),
      regularSale: regularSale !== undefined ? regularSale : true,
      comment: comment || null,
      user,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: salesData,
      message: 'Sales data created successfully'
    });
  } catch (error) {
    console.error('Error creating sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sales data',
      message: error.message
    });
  }
});

// GET /api/sales/:id - Get specific sales data
router.get('/:id', async (req, res) => {
  try {
    const salesData = await SalesData.findByPk(req.params.id);
    
    if (!salesData) {
      return res.status(404).json({
        success: false,
        error: 'Sales data not found'
      });
    }

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales data',
      message: error.message
    });
  }
});

// PUT /api/sales/:id - Update sales data
router.put('/:id', async (req, res) => {
  try {
    const { date, sold, exchange, return: returnAmount, amount, regularSale, comment } = req.body;
    
    const salesData = await SalesData.findByPk(req.params.id);
    
    if (!salesData) {
      return res.status(404).json({
        success: false,
        error: 'Sales data not found'
      });
    }

    await salesData.update({
      date: date || salesData.date,
      sold: sold !== undefined ? parseFloat(sold) : salesData.sold,
      exchange: exchange !== undefined ? parseFloat(exchange) : salesData.exchange,
      return: returnAmount !== undefined ? parseFloat(returnAmount) : salesData.return,
      amount: amount !== undefined ? parseFloat(amount) : salesData.amount,
      regularSale: regularSale !== undefined ? regularSale : salesData.regularSale,
      comment: comment !== undefined ? comment : salesData.comment
    });

    res.json({
      success: true,
      data: salesData,
      message: 'Sales data updated successfully'
    });
  } catch (error) {
    console.error('Error updating sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sales data',
      message: error.message
    });
  }
});

// DELETE /api/sales/:id - Delete sales data
router.delete('/:id', async (req, res) => {
  try {
    const salesData = await SalesData.findByPk(req.params.id);
    
    if (!salesData) {
      return res.status(404).json({
        success: false,
        error: 'Sales data not found'
      });
    }

    await salesData.destroy();

    res.json({
      success: true,
      message: 'Sales data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sales data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sales data',
      message: error.message
    });
  }
});

// GET /api/sales/summary/stats - Get sales statistics
router.get('/summary/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };

    const stats = await SalesData.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('sold')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.col('exchange')), 'totalExchange'],
        [sequelize.fn('SUM', sequelize.col('return')), 'totalReturn'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "regularSale" = true THEN 1 END')), 'regularSales'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "regularSale" = false THEN 1 END')), 'irregularSales']
      ]
    });

    res.json({
      success: true,
      data: stats[0],
      message: 'Sales statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales statistics',
      message: error.message
    });
  }
});

module.exports = router;