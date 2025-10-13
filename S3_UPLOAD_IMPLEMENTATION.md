# S3 File Upload Implementation for Udupiyar Operations

## Overview
This implementation provides AWS S3 integration for printing image uploads. The system provides a complete backend API and frontend service for secure file uploads with proper validation and error handling.

## Backend Implementation

### Dependencies Added
```bash
npm install aws-sdk multer multer-s3 uuid
```

### Files Created/Modified

#### 1. `/backend/config/s3.js`
- AWS S3 configuration
- Multer setup for file upload handling
- File validation (10MB limit, image files only)
- Unique filename generation with timestamps

#### 2. `/backend/routes/upload.js`
- `POST /api/upload/printing-image` - Upload image to S3
- `GET /api/upload/printing-image/:fileName` - Get signed URL for viewing
- `DELETE /api/upload/printing-image/:fileName` - Delete image from S3

#### 3. `/backend/models/PrintingData.js`
- Added `imageName` field to store S3 key/filename
- Updated `imageUrl` field for S3 URL storage

#### 4. `/backend/server.js`
- Added upload routes with `/api` prefix
- Integrated S3 upload functionality

## Frontend Implementation

### Files Created

#### 1. `/frontend/src/services/s3UploadService.js`
- S3 upload service class
- Error handling for network and server errors
- Helper functions for Indian timezone filename generation
- Support for signed URLs and image deletion

#### 2. `/frontend/src/components/Printing.js`
- Updated Printing component using S3 backend integration
- Real-time upload progress and status
- Detailed upload result display
- Signed URL integration for viewing uploaded images

## Configuration

### Environment Variables Required

#### Backend (`.env`)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_BUCKET_NAME=your-s3-bucket-name
```

#### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:4000
```

## S3 Bucket Setup

### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPrintingImageUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/your-iam-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/printing-images/*"
    }
  ]
}
```

### 3. CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## API Endpoints

### Upload Printing Image
```http
POST /api/upload/printing-image
Content-Type: multipart/form-data

Body:
- image: file (required)
- printingDataId: string (optional)
- description: string (optional) 
- uploadedBy: string (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://s3.amazonaws.com/bucket/printing-images/20241013-uuid-filename.jpg",
    "fileName": "printing-images/20241013-uuid-filename.jpg",
    "originalName": "original-filename.jpg",
    "size": 1048576,
    "uploadedAt": "2024-10-13T15:30:00.000Z",
    "printingDataId": "uuid-or-null"
  }
}
```

### Get Signed URL
```http
GET /api/upload/printing-image/filename.jpg
```

**Response:**
```json
{
  "success": true,
  "signedUrl": "https://s3.amazonaws.com/bucket/printing-images/filename.jpg?X-Amz-Algorithm=..."
}
```

### Delete Image
```http
DELETE /api/upload/printing-image/filename.jpg
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## File Naming Convention

Files are automatically named using Indian timezone:
```
printing-images/YYYY-MM-DD-{uuid}-{original-name}
```

Example: `printing-images/2024-10-13-abc123-proof_image.jpg`

## Security Features

1. **File Type Validation**: Only image files allowed
2. **File Size Limit**: 10MB maximum
3. **Unique Filenames**: UUID prevents collisions
4. **Signed URLs**: Temporary access (1 hour expiry)
5. **Error Handling**: Comprehensive error responses
6. **Input Sanitization**: Multer handles multipart parsing safely

## Implementation Steps

### Backend Setup:
1. Install S3 dependencies
2. Configure AWS credentials
3. Create S3 upload routes
4. Update database model

### Frontend Updates:
1. Update upload functions to use backend API
2. Handle API response format
3. Add signed URL support

## Performance Benefits

1. **Scalability**: S3 handles unlimited storage
2. **Cost**: Pay-per-use pricing model
3. **CDN Integration**: Easy CloudFront setup
4. **Backup**: Built-in redundancy and versioning
5. **Security**: IAM-based access control

## Monitoring and Logs

- Backend logs AWS SDK operations
- Frontend logs upload progress and errors
- S3 access logs available via AWS CloudTrail
- Error tracking through application logs

## Next Steps

1. **Production Setup**:
   - Create production S3 bucket
   - Configure CloudFront CDN
   - Set up proper IAM roles
   - Update environment variables

2. **Enhanced Features**:
   - Image resizing/optimization
   - Progress bars for uploads
   - Batch upload support
   - Metadata extraction

3. **Production Deployment**:
   - Set up production S3 bucket
   - Configure proper IAM roles
   - Update environment variables