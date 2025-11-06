"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const global_exception_filter_1 = require("./common/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    });
    const requestCounts = new Map();
    app.use((req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowMs = 15 * 60 * 1000;
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
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8083',
        'http://localhost:19006',
        'https://plutex-admin-production.up.railway.app',
        'https://plutex-admin-production.up.railway.app/*',
    ];
    const envOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
    const parsedEnvOrigins = envOrigins
        ? envOrigins.split(',').map(o => o.trim()).filter(Boolean)
        : [];
    const allowedOrigins = parsedEnvOrigins.length > 0 ? parsedEnvOrigins : defaultOrigins;
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                return callback(null, true);
            }
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        stopAtFirstError: true,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`🚀 Plutex Backend is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🗄️  Database URL: ${process.env.DATABASE_URL || 'file:./dev.db (SQLite)'}`);
    if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl.startsWith('postgresql://')) {
            console.log(`📊 Database Type: PostgreSQL`);
            const url = new URL(dbUrl);
            console.log(`📊 Database Host: ${url.hostname}:${url.port}`);
            console.log(`📊 Database Name: ${url.pathname.substring(1)}`);
            console.log(`📊 Database User: ${url.username}`);
        }
        else if (dbUrl.startsWith('file:')) {
            console.log(`📊 Database Type: SQLite`);
            console.log(`📊 Database File: ${dbUrl}`);
        }
    }
    else {
        console.log(`📊 Database Type: SQLite (default)`);
        console.log(`📊 Database File: ./dev.db`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map