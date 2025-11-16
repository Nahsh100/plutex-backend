"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
const global_exception_filter_1 = require("../src/common/global-exception.filter");
const express = require("express");
const expressApp = express();
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
const createNestServer = async (expressInstance) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance), { cors: false });
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
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        stopAtFirstError: true,
    }));
    app.setGlobalPrefix('api');
    await app.init();
    return app;
};
let cachedServer;
exports.default = async (req, res) => {
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
//# sourceMappingURL=index.js.map