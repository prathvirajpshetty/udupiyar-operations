const express = require('express');
const router = express.Router();
const { upload, uploadToS3, s3 } = require('../config/s3');
const { BatchCodeData } = require('../models');

// Upload batch code image to S3
router.post('/batch-code-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('Upload request:', req.file.originalname, (req.file.size / 1024).toFixed(2) + 'KB');

    // Extract additional data from request body
    const {
      batchCodeDataId,
      selectedDate,
      calculatedDates,
      description,
      uploadedBy
    } = req.body;

    // Upload to S3 using our custom function
    const s3Result = await uploadToS3(req.file, {
      description,
      uploadedBy,
      selectedDate
    });

    console.log('S3 upload successful:', s3Result.key);

    // Create or update batch code data record with image information
    let batchCodeRecord;
    
    if (batchCodeDataId) {
      // Update existing record
      batchCodeRecord = await BatchCodeData.findByPk(batchCodeDataId);
      if (batchCodeRecord) {
        await batchCodeRecord.update({
          imageUrl: s3Result.location,
          imageName: s3Result.key,
          originalFileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        });
        console.log('Updated existing batch code data record with image');
      }
    } else {
      // Create new record with image and batch code data
      batchCodeRecord = await BatchCodeData.create({
        selectedDate: selectedDate || new Date().toISOString().split('T')[0],
        calculatedDates: calculatedDates ? JSON.parse(calculatedDates) : null,
        imageUrl: s3Result.location,
        imageName: s3Result.key,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ocrText: null, // Can be filled later with OCR
        user: uploadedBy || 'anonymous',
        timestamp: new Date()
      });
      console.log('Created new batch code data record with image:', batchCodeRecord.id);
    }

    res.json({
      success: true,
      message: 'Batch code image uploaded successfully to S3 and saved to database',
      data: {
        batchCodeDataId: batchCodeRecord.id,
        selectedDate: batchCodeRecord.selectedDate,
        imageUrl: s3Result.location,
        fileName: s3Result.key,
        originalName: req.file.originalname,
        originalSize: req.file.size,
        originalSizeKB: (req.file.size / 1024).toFixed(2) + ' KB',
        compressedSize: s3Result.compressedSize,
        compressedSizeKB: s3Result.compressedSizeKB,
        compressionRatio: s3Result.compressionRatio,
        uploadedAt: new Date().toISOString(),
        folder: s3Result.folder
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Enhanced error handling
    let errorMessage = 'Failed to upload image';
    if (error.code === 'NoSuchBucket') {
      errorMessage = 'S3 bucket does not exist';
    } else if (error.code === 'AccessDenied') {
      errorMessage = 'Access denied to S3 bucket';
    } else if (error.code === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid AWS access key';
    } else if (error.code === 'SignatureDoesNotMatch') {
      errorMessage = 'Invalid AWS secret key';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get signed URL for viewing protected images
router.get('/batch-code-image/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName.startsWith('batch-code-images/') ? fileName : `batch-code-images/${fileName}`,
      Expires: 3600 // 1 hour
    };

    const signedUrl = s3.getSignedUrl('getObject', params);
    
    res.json({
      success: true,
      signedUrl: signedUrl
    });

  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete image from S3
router.delete('/batch-code-image/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName.startsWith('batch-code-images/') ? fileName : `batch-code-images/${fileName}`
    };

    await s3.deleteObject(params).promise();
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get batch code data with images (now all in one table)
router.get('/batch-code-data', async (req, res) => {
  try {
    const { selectedDate, user, limit = 50, offset = 0 } = req.query;
    
    const whereClause = {};
    
    // Add filters if provided
    if (selectedDate) {
      whereClause.selectedDate = selectedDate;
    }
    
    if (user) {
      whereClause.user = user;
    }

    const batchCodeData = await BatchCodeData.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        records: batchCodeData.rows,
        totalCount: batchCodeData.count,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(batchCodeData.count / limit),
        hasMore: (offset + limit) < batchCodeData.count
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

// Get batch code data by ID
router.get('/batch-code-data/:id', async (req, res) => {
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
    console.error('Get batch code data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch code data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;