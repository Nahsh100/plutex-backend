import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationService {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Basic HTML sanitization without external dependency
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
      .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '') // Remove link tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .trim();
  }

  /**
   * Sanitize plain text by removing potentially dangerous characters
   */
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove null bytes and other control characters
    return input
      .replace(/\x00/g, '') // Null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .trim();
  }

  /**
   * Sanitize email addresses
   */
  sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\.\@\-\+]/g, ''); // Only allow word chars, dots, @, hyphens, plus
  }

  /**
   * Sanitize phone numbers
   */
  sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[^\d\+\-\(\)\s]/g, '') // Only allow digits, +, -, (), spaces
      .trim();
  }

  /**
   * Sanitize URLs
   */
  sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const url = new URL(input);

      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }

      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize file names to prevent directory traversal
   */
  sanitizeFileName(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[^a-zA-Z0-9\.\-_]/g, '') // Only allow alphanumeric, dots, hyphens, underscores
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize SQL-like input to prevent injection (basic protection)
   */
  sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove potential SQL injection patterns
    const sqlPatterns = [
      /('|(\')|--|\s|\/\*|\*\/|xp_|sp_|EXEC|exec|UNION|union|SELECT|select|INSERT|insert|DELETE|delete|UPDATE|update|DROP|drop|CREATE|create|ALTER|alter)/gi
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  /**
   * Sanitize numeric input
   */
  sanitizeNumeric(input: string | number): number | null {
    if (typeof input === 'number') {
      return isFinite(input) ? input : null;
    }

    if (typeof input === 'string') {
      const num = parseFloat(input.replace(/[^0-9\.\-]/g, ''));
      return isFinite(num) ? num : null;
    }

    return null;
  }

  /**
   * Sanitize boolean input
   */
  sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      return ['true', '1', 'yes', 'on'].includes(lower);
    }

    if (typeof input === 'number') {
      return input === 1;
    }

    return false;
  }

  /**
   * Deep sanitize an object recursively
   */
  sanitizeObject(obj: any, options: {
    sanitizeHtml?: boolean;
    sanitizeText?: boolean;
    maxDepth?: number;
  } = {}): any {
    const { sanitizeHtml = false, sanitizeText = true, maxDepth = 10 } = options;

    if (maxDepth <= 0) {
      return obj;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      if (sanitizeHtml) {
        return this.sanitizeHtml(obj);
      }
      if (sanitizeText) {
        return this.sanitizeText(obj);
      }
      return obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item =>
        this.sanitizeObject(item, { ...options, maxDepth: maxDepth - 1 })
      );
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value, { ...options, maxDepth: maxDepth - 1 });
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize pagination parameters
   */
  sanitizePagination(page?: number | string, limit?: number | string) {
    const sanitizedPage = Math.max(1, Math.floor(this.sanitizeNumeric(page) || 1));
    const sanitizedLimit = Math.min(100, Math.max(1, Math.floor(this.sanitizeNumeric(limit) || 10)));

    return {
      page: sanitizedPage,
      limit: sanitizedLimit,
      offset: (sanitizedPage - 1) * sanitizedLimit,
    };
  }

  /**
   * Validate and sanitize sort parameters
   */
  sanitizeSort(sortBy?: string, sortOrder?: string, allowedFields: string[] = []) {
    let sanitizedSortBy = 'createdAt'; // Default sort field
    let sanitizedSortOrder: 'asc' | 'desc' = 'desc'; // Default sort order

    if (sortBy && typeof sortBy === 'string') {
      const cleanSortBy = this.sanitizeText(sortBy);
      if (allowedFields.includes(cleanSortBy)) {
        sanitizedSortBy = cleanSortBy;
      }
    }

    if (sortOrder && typeof sortOrder === 'string') {
      const cleanSortOrder = this.sanitizeText(sortOrder).toLowerCase();
      if (['asc', 'desc'].includes(cleanSortOrder)) {
        sanitizedSortOrder = cleanSortOrder as 'asc' | 'desc';
      }
    }

    return {
      sortBy: sanitizedSortBy,
      sortOrder: sanitizedSortOrder,
    };
  }
}