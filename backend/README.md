# Udupiyar Operations Backend

A robust Node.js backend API for the Udupiyar Operations Management System, built with Express.js, Sequelize ORM, and PostgreSQL.

## 🚀 Features

- **RESTful API** for Production, Sales, and Printing data
- **PostgreSQL Database** with Sequelize ORM
- **AWS Lambda Ready** for serverless deployment
- **Data Validation** and error handling
- **CORS Support** for frontend integration
- **Security Headers** with Helmet.js
- **Request Logging** with Morgan
- **Database Migrations** and seeding support

## 📦 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **dotenv** - Environment variables
- **AWS Lambda** - Serverless deployment support
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
   
   Copy the `.env` file and update with your database credentials:
   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=udupiyar_operations
   DB_HOST=your_username
   DB_PASSWORD=your_password
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

3. **Database Setup**
   
   Create the database:
   ```bash
   npm run db:create
   ```
   
   Run migrations (creates tables):
   ```bash
   npm run db:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

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

### Printing Data
- `GET /api/printing` - Get all printing data (with pagination)
- `POST /api/printing` - Create new printing data
- `GET /api/printing/:id` - Get specific printing data
- `PUT /api/printing/:id` - Update printing data
- `DELETE /api/printing/:id` - Delete printing data
- `POST /api/printing/calculate-dates` - Calculate printing dates

## 📊 Database Schema

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

### PrintingData
- `id` (UUID, Primary Key)
- `selectedDate` (Date) - Selected date for calculations
- `calculatedDates` (JSONB) - Calculated dates information
- `imageUrl` (Text) - Firebase storage URL
- `imagePath` (String) - Firebase storage path
- `ocrText` (Text) - OCR extracted text
- `user` (String) - Username who uploaded data
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
- `npm run db:create` - Create database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Run seeders
- `npm run db:reset` - Reset database (drop, create, migrate)

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configured for frontend integration
- **Input Validation** - Request body validation
- **Error Handling** - Comprehensive error responses
- **SQL Injection Protection** - Sequelize ORM protection

## 📱 Integration with Frontend

The backend is designed to work seamlessly with your React frontend. Update your frontend data storage utilities to use these API endpoints instead of Firebase for certain operations.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.