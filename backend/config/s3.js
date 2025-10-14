const AWS = require('aws-sdk');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Simple multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit to handle large mobile photos
  },
  fileFilter: function (req, file, cb) {
    console.log('File filter check:', file.mimetype);
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Image compression function
const compressImage = async (buffer, targetSizeKB = 100) => {
  try {
    console.log('Original image size:', (buffer.length / 1024).toFixed(2), 'KB');
    
    // Start with reasonable quality
    let quality = 85;
    let compressed;
    let attempts = 0;
    const maxAttempts = 10;
    const targetBytes = targetSizeKB * 1024;

    while (attempts < maxAttempts) {
      compressed = await sharp(buffer)
        .jpeg({ 
          quality: quality,
          progressive: true,
          mozjpeg: true 
        })
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer();

      // Log only if compression takes multiple attempts
      if (attempts > 2) {
        console.log(`Compression attempt ${attempts + 1}: ${quality}% quality, ${(compressed.length / 1024).toFixed(1)}KB`);
      }

      if (compressed.length <= targetBytes) {
        break;
      }

      // Reduce quality more aggressively as we approach the limit
      if (compressed.length > targetBytes * 2) {
        quality -= 15;
      } else if (compressed.length > targetBytes * 1.5) {
        quality -= 10;
      } else {
        quality -= 5;
      }

      attempts++;

      // If quality gets too low, try reducing dimensions
      if (quality < 20 && attempts < maxAttempts) {
        const newWidth = Math.floor(1920 * (0.9 - attempts * 0.1));
        compressed = await sharp(buffer)
          .jpeg({ quality: 30, progressive: true })
          .resize(newWidth, newWidth, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .toBuffer();
      }

      if (quality < 10) break;
    }

    console.log('Final compressed size:', (compressed.length / 1024).toFixed(2), 'KB');
    return compressed;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};

// Manual S3 upload function
const uploadToS3 = async (file, metadata = {}) => {
  try {
    // Generate filename with DD-MM-YYYY format (Indian date format) and monthly folder structure
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    const monthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const uuid = uuidv4().substring(0, 8); // Short UUID for uniqueness
    const fileName = `batch-code-images/${monthYear}/${day}-${month}-${year}_${uuid}.${fileExtension}`;

    console.log('Processing image upload:', file.originalname);
    
    // Compress the image to under 100KB
    const compressedBuffer = await compressImage(file.buffer, 100);

    // Sanitize metadata for S3 (must be valid HTTP header values)
    const sanitizeMetadata = (obj) => {
      const sanitized = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        // Only include defined, non-null values and convert to strings
        if (value !== undefined && value !== null && value !== '') {
          // Replace any characters that might be invalid in HTTP headers
          const sanitizedKey = key.replace(/[^a-zA-Z0-9\-]/g, '');
          const sanitizedValue = String(value).replace(/[\r\n\t]/g, ' ').substring(0, 2000); // AWS limit
          if (sanitizedKey && sanitizedValue) {
            sanitized[sanitizedKey] = sanitizedValue;
          }
        }
      });
      return sanitized;
    };

    const s3Metadata = sanitizeMetadata({
      originalname: file.originalname,
      originalsize: (file.buffer.length / 1024).toFixed(2) + 'KB',
      compressedsize: (compressedBuffer.length / 1024).toFixed(2) + 'KB',
      uploadedby: metadata.uploadedBy || 'unknown',
      uploadedat: new Date().toISOString(),
      description: metadata.description,
      printingdataid: metadata.printingDataId
    });

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: compressedBuffer,
      ContentType: 'image/jpeg', // Always JPEG after compression
      Metadata: s3Metadata,
      CacheControl: 'max-age=31536000', // Cache for 1 year
      ACL: 'private' // Keep images private
    };

    const result = await s3.upload(uploadParams).promise();
    
    const compressionRatio = ((1 - (compressedBuffer.length / file.buffer.length)) * 100).toFixed(1);
    
    return {
      location: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag,
      folder: monthYear,
      originalSize: file.buffer.length,
      compressedSize: compressedBuffer.length,
      compressedSizeKB: (compressedBuffer.length / 1024).toFixed(2) + ' KB',
      compressionRatio: compressionRatio + '%'
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

module.exports = { s3, upload, uploadToS3, compressImage };