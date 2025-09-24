import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = undefined;

    // Log the exception for debugging
    this.logger.error(
      `Exception caught: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        url: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params,
      },
    );

    if (exception instanceof HttpException) {
      // Handle HTTP exceptions (validation errors, auth errors, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma database errors
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002':
          message = 'A record with this information already exists';
          details = { field: exception.meta?.target };
          break;
        case 'P2025':
          message = 'Record not found';
          status = HttpStatus.NOT_FOUND;
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
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // Handle Prisma validation errors
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Invalid data provided';
      details = process.env.NODE_ENV === 'development' ? { prismaError: exception.message } : undefined;
    } else if (exception instanceof Error) {
      // Handle generic errors
      if (exception.message.includes('JWT')) {
        status = HttpStatus.UNAUTHORIZED;
        error = 'Authentication Error';
        message = 'Invalid or expired token';
      } else if (exception.message.includes('ENOTFOUND') || exception.message.includes('ECONNREFUSED')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        error = 'Service Unavailable';
        message = 'External service is currently unavailable';
      } else if (exception.message.includes('File too large')) {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        error = 'File Too Large';
        message = 'Uploaded file exceeds size limit';
      } else {
        message = process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : exception.message;
        details = process.env.NODE_ENV === 'development' ? { stack: exception.stack } : undefined;
      }
    }

    // Create standardized error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add details only in development or for specific error types
    if (details && (process.env.NODE_ENV === 'development' || status === HttpStatus.BAD_REQUEST)) {
      errorResponse.details = details;
    }

    // Send error response
    response.status(status).json(errorResponse);

    // Log error details for monitoring (you could send to external logging service)
    this.logger.error(
      `Error Response: ${status} - ${JSON.stringify(errorResponse)}`,
      undefined,
      'GlobalExceptionFilter',
    );
  }
}