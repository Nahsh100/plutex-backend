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
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  
  app.use((req, res, next) => {
    // Skip rate limiting in development
    if (isDevelopment) {
      return next();
    }
    
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

  // Enable CORS with explicit preflight handling
  const defaultOrigins = [
    'http://localhost:3000',
    'http://10.3.91.214:3000',
    'https://plutex-admin-production.up.railway.app',
    'https://plutex-admin.vercel.app',
    'https://plutex.co.zm',
    'https://www.plutex.co.zm',
    '*.plutex.co.zm', // Allow subdomains of plutex.co.zm
  ];

  // Check for production environment specific origins
  const envOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
  const parsedEnvOrigins = envOrigins
    ? envOrigins.split(',').map(o => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = parsedEnvOrigins.length > 0 ? parsedEnvOrigins : defaultOrigins;

  // Use dynamic origin function for more flexible CORS handling
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, origin?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (isDevelopment) {
        console.log(`✅ CORS allowed (dev mode): ${origin}`);
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        // Check for exact match
        if (allowedOrigin === origin) {
          return true;
        }
        // Check if allowedOrigin has wildcard pattern and origin matches
        if (allowedOrigin.includes('*')) {
          const regexPattern = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
          return regexPattern.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        console.log(`✅ CORS allowed: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  console.log(`🔧 Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  console.log(`🌐 CORS enabled for: ${isDevelopment ? 'ALL ORIGINS (dev mode)' : allowedOrigins.join(', ')}`);
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
