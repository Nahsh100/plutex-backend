"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let details = undefined;
        this.logger.error(`Exception caught: ${exception instanceof Error ? exception.message : 'Unknown error'}`, exception instanceof Error ? exception.stack : undefined, {
            url: request.url,
            method: request.method,
            body: request.body,
            query: request.query,
            params: request.params,
        });
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message = responseObj.message || responseObj.error || exception.message;
                error = responseObj.error || exception.name;
                details = responseObj.details;
            }
            else {
                message = exceptionResponse;
                error = exception.name;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            error = 'Database Error';
            switch (exception.code) {
                case 'P2002':
                    message = 'A record with this information already exists';
                    details = { field: exception.meta?.target };
                    break;
                case 'P2025':
                    message = 'Record not found';
                    status = common_1.HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Invalid reference to related record';
                    break;
                case 'P2014':
                    message = 'Invalid ID provided';
                    break;
                default:
                    message = 'Database operation failed';
                    details = process.env.NODE_ENV === 'development' ? { code: exception.code } : undefined;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            error = 'Validation Error';
            message = 'Invalid data provided';
            details = process.env.NODE_ENV === 'development' ? { prismaError: exception.message } : undefined;
        }
        else if (exception instanceof Error) {
            if (exception.message.includes('JWT')) {
                status = common_1.HttpStatus.UNAUTHORIZED;
                error = 'Authentication Error';
                message = 'Invalid or expired token';
            }
            else if (exception.message.includes('ENOTFOUND') || exception.message.includes('ECONNREFUSED')) {
                status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                error = 'Service Unavailable';
                message = 'External service is currently unavailable';
            }
            else if (exception.message.includes('File too large')) {
                status = common_1.HttpStatus.PAYLOAD_TOO_LARGE;
                error = 'File Too Large';
                message = 'Uploaded file exceeds size limit';
            }
            else {
                message = process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : exception.message;
                details = process.env.NODE_ENV === 'development' ? { stack: exception.stack } : undefined;
            }
        }
        const errorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (details && (process.env.NODE_ENV === 'development' || status === common_1.HttpStatus.BAD_REQUEST)) {
            errorResponse.details = details;
        }
        response.status(status).json(errorResponse);
        this.logger.error(`Error Response: ${status} - ${JSON.stringify(errorResponse)}`, undefined, 'GlobalExceptionFilter');
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map