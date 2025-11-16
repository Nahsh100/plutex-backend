import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '../src/common/global-exception.filter';
import * as express from 'express';

const expressApp = express();

// Configure body parser with larger limits for base64 images
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    { cors: false } // We'll handle CORS via Vercel headers
  );

  // Enable CORS with explicit configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://plutex.co.zm',
      'https://www.plutex.co.zm',
      'https://plutex-admin.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
    stopAtFirstError: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  await app.init();
  return app;
};

let cachedServer: any;

export default async (req: any, res: any) => {
  // Handle OPTIONS preflight requests immediately
  if (req.method === 'OPTIONS') {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://plutex.co.zm',
      'https://www.plutex.co.zm',
      'https://plutex-admin.vercel.app',
    ];
    
    const origin = req.headers.origin || req.headers.referer;
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://www.plutex.co.zm';
    
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (!cachedServer) {
    cachedServer = await createNestServer(expressApp);
  }

  return expressApp(req, res);
};
