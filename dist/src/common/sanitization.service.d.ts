export declare class SanitizationService {
    sanitizeHtml(input: string): string;
    sanitizeText(input: string): string;
    sanitizeEmail(input: string): string;
    sanitizePhone(input: string): string;
    sanitizeUrl(input: string): string;
    sanitizeFileName(input: string): string;
    sanitizeSqlInput(input: string): string;
    sanitizeNumeric(input: string | number): number | null;
    sanitizeBoolean(input: any): boolean;
    sanitizeObject(obj: any, options?: {
        sanitizeHtml?: boolean;
        sanitizeText?: boolean;
        maxDepth?: number;
    }): any;
    sanitizePagination(page?: number | string, limit?: number | string): {
        page: number;
        limit: number;
        offset: number;
    };
    sanitizeSort(sortBy?: string, sortOrder?: string, allowedFields?: string[]): {
        sortBy: string;
        sortOrder: "asc" | "desc";
    };
}
