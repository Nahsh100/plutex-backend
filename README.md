# Plutex Backend API

A comprehensive NestJS backend API for the Plutex admin portal, built with Prisma ORM and PostgreSQL.

## 🚀 Features

- **Complete CRUD Operations** for all entities
- **Prisma ORM** with PostgreSQL
- **Input Validation** using class-validator
- **CORS Configuration** for frontend integration
- **Environment Configuration** with dotenv
- **RESTful API Design** following best practices
- **TypeScript** for type safety
- **Auto-generated Prisma Client** with type safety

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd plutex-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/plutex_admin?schema=public"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h

   # Application Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb plutex_admin
   
   # Run Prisma migrations
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 📊 Database Schema

### Models

- **User** - Customer and admin user management
- **Vendor** - Vendor account management
- **Category** - Product category organization
- **Product** - Product catalog management
- **Order** - Order processing and tracking
- **OrderItem** - Individual items in orders
- **Review** - Product review system

### Key Relationships

- Users can have multiple Orders and Reviews
- Vendors can have multiple Products
- Categories can have multiple Products
- Products belong to one Vendor and one Category
- Orders contain multiple OrderItems
- OrderItems reference Products

### Enums

- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **UserRole**: CUSTOMER, ADMIN, VENDOR
- **VendorStatus**: ACTIVE, INACTIVE, PENDING, SUSPENDED
- **ProductAvailability**: IN_STOCK, OUT_OF_STOCK, LOW_STOCK, DISCONTINUED
- **OrderStatus**: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **PaymentStatus**: PENDING, PAID, FAILED, REFUNDED
- **ReviewStatus**: PENDING, APPROVED, REJECTED

## 🔌 API Endpoints

### Base URL: `http://localhost:3001/api`

### Users
- `GET /users` - Get all users
- `GET /users/stats` - Get user statistics
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products
- `GET /products` - Get all products
- `GET /products/stats` - Get product statistics
- `GET /products/category/:categoryId` - Get products by category
- `GET /products/vendor/:vendorId` - Get products by vendor
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Vendors
- `GET /vendors` - Get all vendors
- `GET /vendors/stats` - Get vendor statistics
- `GET /vendors/:id` - Get vendor by ID
- `POST /vendors` - Create new vendor
- `PATCH /vendors/:id` - Update vendor
- `DELETE /vendors/:id` - Delete vendor

### Orders
- `GET /orders` - Get all orders
- `GET /orders/stats` - Get order statistics
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PATCH /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

## 📝 Data Transfer Objects (DTOs)

### CreateUserDto
```typescript
{
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status?: UserStatus;
  role?: UserRole;
  marketingConsent?: boolean;
  password?: string;
}
```

### CreateProductDto
```typescript
{
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  images: string[];
  specifications?: Record<string, any>;
  availability?: ProductAvailability;
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sku?: string;
  weight?: number;
  dimensions?: string;
  vendorId: string;
  categoryId: string;
}
```

## 🔧 Configuration

### Database Configuration
The application uses Prisma ORM with PostgreSQL. Database configuration is handled through the `DATABASE_URL` environment variable.

### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Push schema changes (development only)
npx prisma db push
```

### CORS Configuration
CORS is enabled for frontend integration. Configure the `CORS_ORIGIN` environment variable to match your frontend URL.

### Validation
Input validation is handled globally using class-validator decorators and the ValidationPipe.

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```bash
# Build Docker image
docker build -t plutex-backend .

# Run container
docker run -p 3001:3001 plutex-backend
```

## 🔒 Security

- Input validation using class-validator
- CORS configuration
- Environment variable management
- Password hashing with bcryptjs
- JWT token support (ready for implementation)

## 📈 Monitoring

The application includes basic logging and error handling. For production deployment, consider adding:

- Application monitoring (e.g., New Relic, DataDog)
- Error tracking (e.g., Sentry)
- Health check endpoints
- Rate limiting
- Request logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
