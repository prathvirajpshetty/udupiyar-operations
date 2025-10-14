const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findOne({
      where: { 
        username: username.toLowerCase(),
        isActive: true
      }
    });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    // Return user info (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const user = await User.findOne({
      where: { 
        username: username.toLowerCase(),
        isActive: true
      },
      attributes: ['id', 'username', 'role', 'lastLoginAt', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;