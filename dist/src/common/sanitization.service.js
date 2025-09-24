"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationService = void 0;
const common_1 = require("@nestjs/common");
let SanitizationService = class SanitizationService {
    sanitizeHtml(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .trim();
    }
    sanitizeText(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/\x00/g, '')
            .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim();
    }
    sanitizeEmail(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\.\@\-\+]/g, '');
    }
    sanitizePhone(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/[^\d\+\-\(\)\s]/g, '')
            .trim();
    }
    sanitizeUrl(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        try {
            const url = new URL(input);
            if (!['http:', 'https:'].includes(url.protocol)) {
                return '';
            }
            return url.toString();
        }
        catch {
            return '';
        }
    }
    sanitizeFileName(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/[^a-zA-Z0-9\.\-_]/g, '')
            .replace(/\.{2,}/g, '.')
            .replace(/^\.+|\.+$/g, '')
            .substring(0, 255);
    }
    sanitizeSqlInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        const sqlPatterns = [
            /('|(\')|--|\s|\/\*|\*\/|xp_|sp_|EXEC|exec|UNION|union|SELECT|select|INSERT|insert|DELETE|delete|UPDATE|update|DROP|drop|CREATE|create|ALTER|alter)/gi
        ];
        let sanitized = input;
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        return sanitized.trim();
    }
    sanitizeNumeric(input) {
        if (typeof input === 'number') {
            return isFinite(input) ? input : null;
        }
        if (typeof input === 'string') {
            const num = parseFloat(input.replace(/[^0-9\.\-]/g, ''));
            return isFinite(num) ? num : null;
        }
        return null;
    }
    sanitizeBoolean(input) {
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
    sanitizeObject(obj, options = {}) {
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
            return obj.map(item => this.sanitizeObject(item, { ...options, maxDepth: maxDepth - 1 }));
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = this.sanitizeText(key);
                sanitized[sanitizedKey] = this.sanitizeObject(value, { ...options, maxDepth: maxDepth - 1 });
            }
            return sanitized;
        }
        return obj;
    }
    sanitizePagination(page, limit) {
        const sanitizedPage = Math.max(1, Math.floor(this.sanitizeNumeric(page) || 1));
        const sanitizedLimit = Math.min(100, Math.max(1, Math.floor(this.sanitizeNumeric(limit) || 10)));
        return {
            page: sanitizedPage,
            limit: sanitizedLimit,
            offset: (sanitizedPage - 1) * sanitizedLimit,
        };
    }
    sanitizeSort(sortBy, sortOrder, allowedFields = []) {
        let sanitizedSortBy = 'createdAt';
        let sanitizedSortOrder = 'desc';
        if (sortBy && typeof sortBy === 'string') {
            const cleanSortBy = this.sanitizeText(sortBy);
            if (allowedFields.includes(cleanSortBy)) {
                sanitizedSortBy = cleanSortBy;
            }
        }
        if (sortOrder && typeof sortOrder === 'string') {
            const cleanSortOrder = this.sanitizeText(sortOrder).toLowerCase();
            if (['asc', 'desc'].includes(cleanSortOrder)) {
                sanitizedSortOrder = cleanSortOrder;
            }
        }
        return {
            sortBy: sanitizedSortBy,
            sortOrder: sanitizedSortOrder,
        };
    }
};
exports.SanitizationService = SanitizationService;
exports.SanitizationService = SanitizationService = __decorate([
    (0, common_1.Injectable)()
], SanitizationService);
//# sourceMappingURL=sanitization.service.js.map