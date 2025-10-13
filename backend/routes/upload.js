const express = require('express');
const router = express.Router();
const { upload, uploadToS3, s3, compressImage } = require('../config/s3');
const { PrintingData } = require('../models');

// Upload printing image to S3
router.post('/printing-image', upload.single('image'), async (req, res) => {
  try {
    console.log('Received upload request-------');
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('Upload request received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      sizeKB: (req.file.size / 1024).toFixed(2) + ' KB'
    });

    // Extract additional data from request body
    const {
      printingDataId,
      description,
      uploadedBy
    } = req.body;

    // Log the metadata being sent to S3
    console.log('Metadata for S3 upload:', {
      description,
      uploadedBy,
      printingDataId: printingDataId || 'not provided'
    });

    // Upload to S3 using our custom function
    const s3Result = await uploadToS3(req.file, {
      description,
      uploadedBy,
      printingDataId
    });

    console.log('S3 upload successful:', s3Result);

    // Update printing data record with image URL if printingDataId is provided
    if (printingDataId) {
      const printingRecord = await PrintingData.findByPk(printingDataId);
      if (printingRecord) {
        await printingRecord.update({
          imageUrl: s3Result.location,
          imageName: s3Result.key
        });
        console.log('Updated printing data record:', printingDataId);
      }
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully to S3',
      data: {
        imageUrl: s3Result.location,
        fileName: s3Result.key,
        originalName: req.file.originalname,
        originalSize: req.file.size,
        originalSizeKB: (req.file.size / 1024).toFixed(2) + ' KB',
        compressedSize: s3Result.compressedSize,
        compressedSizeKB: s3Result.compressedSizeKB,
        compressionRatio: s3Result.compressionRatio,
        uploadedAt: new Date().toISOString(),
        printingDataId: printingDataId || null,
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
router.get('/printing-image/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    console.log('Generating signed URL for:', fileName);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName.startsWith('printing-images/') ? fileName : `printing-images/${fileName}`,
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
router.delete('/printing-image/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    console.log('Deleting S3 object:', fileName);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName.startsWith('printing-images/') ? fileName : `printing-images/${fileName}`
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

// Test compression endpoint (for development)
router.post('/test-compression', upload.single('image'), async (req, res) => {
  try {
    console.log('Testing image compression...');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const originalSizeKB = req.file.size / 1024;
    console.log('Original image size:', originalSizeKB.toFixed(2), 'KB');

    const compressedBuffer = await compressImage(req.file.buffer, 100);
    const compressedSizeKB = compressedBuffer.length / 1024;
    
    res.json({
      success: true,
      message: 'Image compression test completed',
      data: {
        originalSize: req.file.size,
        originalSizeKB: originalSizeKB.toFixed(2) + ' KB',
        compressedSize: compressedBuffer.length,
        compressedSizeKB: compressedSizeKB.toFixed(2) + ' KB',
        compressionRatio: (originalSizeKB / compressedSizeKB).toFixed(2) + 'x',
        savingsPercent: (((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100).toFixed(1) + '%'
      }
    });

  } catch (error) {
    console.error('Compression test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compress image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;