# Udupiyar Operations Backend

A robust Node.js backend API for the Udupiyar Operations Management System, built with Express.js, Sequelize ORM, and PostgreSQL.

## 🚀 Features

- **RESTful API** for Production, Sales, Batch Code Print data, and User Authentication
- **PostgreSQL Database** with Sequelize ORM
- **AWS S3 Integration** for image storage with compression
- **User Authentication** with database-backed login system
- **Data Validation** and error handling
- **CORS Support** for frontend integration
- **Security Headers** with Helmet.js
- **Request Logging** with Morgan
- **Database Migrations** and seeding support
- **Image Processing** with Sharp for compression and optimization

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **AWS S3** - File storage and image compression
- **Sharp** - Image processing and compression
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logging

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   
   Copy the `.env.example` file to `.env` and update with your database credentials:
   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=udupiyar-operations
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   
   # AWS S3 Configuration (for image storage)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

3. **Database Setup**
   
   Create and initialize the database:
   ```bash
   npx sequelize-cli db:create
   ```
   
   Run migrations (creates tables):
   ```bash
   npm run db:migrate
   ```
   
   Seed the database with initial users:
   ```bash
   npm run db:seed
   ```
   
   Or for a complete fresh setup:
   ```bash
   npm run db:init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Initial Users**
   
   After seeding, these users will be available:
   - **Username:** `admin` **Password:** `admin123` **Role:** Admin
   - **Username:** `raghu` **Password:** `raghu123` **Role:** Manager  
   - **Username:** `prakash` **Password:** `prakash123` **Role:** Employee

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify authentication status

### Production Data
- `GET /api/production` - Get all production data (with pagination)
- `POST /api/production` - Create new production data
- `GET /api/production/:id` - Get specific production data
- `PUT /api/production/:id` - Update production data
- `DELETE /api/production/:id` - Delete production data

### Sales Data
- `GET /api/sales` - Get all sales data (with pagination)
- `POST /api/sales` - Create new sales data
- `GET /api/sales/:id` - Get specific sales data
- `PUT /api/sales/:id` - Update sales data
- `DELETE /api/sales/:id` - Delete sales data
- `GET /api/sales/summary/stats` - Get sales statistics

### Batch Code Print Data
- `GET /api/batch-code-print` - Get all batch code print data (with pagination)
- `POST /api/batch-code-print` - Create new batch code print data
- `GET /api/batch-code-print/:id` - Get specific batch code print data
- `PUT /api/batch-code-print/:id` - Update batch code print data
- `DELETE /api/batch-code-print/:id` - Delete batch code print data
- `POST /api/batch-code-print/calculate-dates` - Calculate batch code print dates

### Batch Code Data (Consolidated)
- `GET /api/batch-code-data` - Get all batch code data (with pagination, filters)
- `POST /api/batch-code-data` - Create new batch code data
- `GET /api/batch-code-data/:id` - Get specific batch code data
- `PUT /api/batch-code-data/:id` - Update batch code data
- `DELETE /api/batch-code-data/:id` - Delete batch code data
- `GET /api/batch-code-data/search` - Search batch code data

### File Upload
- `POST /api/upload/batch-code-image` - Upload batch code image to S3 with compression

## 📊 Database Schema

### Users
- `id` (UUID, Primary Key)
- `username` (String, Unique) - Unique username for login
- `password` (String) - User password (stored directly)
- `role` (Enum: admin, manager, employee) - User role for permissions
- `isActive` (Boolean) - Whether the user account is active
- `lastLoginAt` (DateTime) - Last login timestamp
- `createdAt`, `updatedAt` (Auto-generated)

### ProductionData
- `id` (UUID, Primary Key)
- `date` (Date) - Production date
- `productionFor` (Date) - Production for date (usually tomorrow)
- `pouches` (Integer) - Number of pouches produced
- `comment` (Text) - Additional comments
- `user` (String) - Username who entered data
- `timestamp` (DateTime) - Submission timestamp
- `createdAt`, `updatedAt` (Auto-generated)

### SalesData
- `id` (UUID, Primary Key)
- `date` (Date) - Sale date
- `sold` (Decimal) - Amount sold
- `exchange` (Decimal) - Exchange amount
- `return` (Decimal) - Return amount
- `amount` (Decimal) - Total amount
- `regularSale` (Boolean) - Regular sale flag
- `comment` (Text) - Additional comments
- `user` (String) - Username who entered data
- `timestamp` (DateTime) - Submission timestamp
- `createdAt`, `updatedAt` (Auto-generated)

### BatchCodeData (Consolidated)
- `id` (UUID, Primary Key)
- `selectedDate` (Date) - Selected date for batch code calculations
- `calculatedDates` (JSONB) - Calculated dates and batch code information
- `imageUrl` (Text) - S3 URL of uploaded batch code image
- `imageName` (String) - S3 key/filename of uploaded image
- `originalFileName` (String) - Original filename of the uploaded image
- `fileSize` (Integer) - File size in bytes
- `mimeType` (String) - MIME type of the image
- `ocrText` (Text) - OCR extracted text from uploaded image
- `user` (String) - Username who uploaded the data
- `timestamp` (DateTime) - Submission timestamp
- `createdAt`, `updatedAt` (Auto-generated)

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Server
```bash
npm start
```

### AWS Lambda Deployment
The project includes `lambda.js` for serverless deployment:

1. Install Serverless Framework
2. Configure `serverless.yml`
3. Deploy with `serverless deploy`

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:init` - Initialize fresh database (drops all tables and recreates)
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Run database seeders (add initial users)
- `npm run db:seed:undo` - Undo all seeders
- `npm run db:reset` - Reset database (undo last migration, migrate, seed)

### Database Commands Explained

- **`db:init`** - Complete fresh start, destroys all data (development only)
- **`db:migrate`** - Apply schema changes, safe for production
- **`db:seed`** - Add initial data (users, reference data)
- **`db:reset`** - Quick development reset (undo + migrate + seed)

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured for frontend integration with ngrok support
- **Input Validation** - Request body validation
- **Error Handling** - Comprehensive error responses
- **SQL Injection Protection** - Sequelize ORM protection
- **User Authentication** - Database-backed login system
- **Role-based Access** - Admin, Manager, Employee roles

## �️ Image Processing Features

- **AWS S3 Integration** - Secure cloud storage
- **Image Compression** - Automatic compression with Sharp
- **Multiple Format Support** - JPEG, PNG, WebP
- **File Size Validation** - Configurable upload limits
- **Metadata Storage** - Original filename, size, MIME type tracking
- **Organized Storage** - Date-based folder structure in S3

## �📱 Integration with Frontend

The backend is designed to work seamlessly with your React frontend. Key features:

- **Unified API** - Single consolidated endpoint for batch code data
- **Image Upload Flow** - Streamlined upload with metadata linking
- **Authentication Integration** - Secure user session management
- **Data Storage Utilities** - Frontend services for API integration
- **Error Handling** - Consistent error responses for UI feedback

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.