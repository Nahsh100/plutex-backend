import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { GlobalExceptionFilter } from './common/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Basic Security Headers (using built-in Express functionality)
  app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // Simple rate limiting using built-in tracking
  const requestCounts = new Map();
  app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = req.path.includes('/auth') ? 10 : 100;

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const requests = requestCounts.get(ip).filter(time => now - time < windowMs);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
      });
    }

    requests.push(now);
    requestCounts.set(ip, requests);
    next();
  });

  // Configure body parser with larger limits for base64 images
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8083', 'http://localhost:19006'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe with enhanced security
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are found
    transform: true, // Automatically transform payloads to DTO instances
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed validation errors in production
    stopAtFirstError: true, // Stop validation on first error for better performance
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Plutex Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🗄️  Database URL: ${process.env.DATABASE_URL || 'file:./dev.db (SQLite)'}`);
  
  // Log database connection details
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.startsWith('postgresql://')) {
      console.log(`📊 Database Type: PostgreSQL`);
      const url = new URL(dbUrl);
      console.log(`📊 Database Host: ${url.hostname}:${url.port}`);
      console.log(`📊 Database Name: ${url.pathname.substring(1)}`);
      console.log(`📊 Database User: ${url.username}`);
    } else if (dbUrl.startsWith('file:')) {
      console.log(`📊 Database Type: SQLite`);
      console.log(`📊 Database File: ${dbUrl}`);
    }
  } else {
    console.log(`📊 Database Type: SQLite (default)`);
    console.log(`📊 Database File: ./dev.db`);
  }
}
bootstrap();
