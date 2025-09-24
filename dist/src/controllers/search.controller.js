"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("../services/search.service");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    searchProducts(query, categoryId, minPrice, maxPrice, brand, availability, sortBy, sortOrder, page, limit) {
        if (!query) {
            return { products: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, query: '', filters: {} };
        }
        const filters = {
            categoryId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            brand,
            availability,
            sortBy,
            sortOrder,
        };
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.searchService.searchProducts(query, filters, pageNum, limitNum);
    }
    searchCategories(query, page, limit) {
        if (!query) {
            return { categories: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, query: '' };
        }
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.searchService.searchCategories(query, pageNum, limitNum);
    }
    searchVendors(query, page, limit) {
        if (!query) {
            return { vendors: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, query: '' };
        }
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.searchService.searchVendors(query, pageNum, limitNum);
    }
    getSearchSuggestions(query, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.searchService.getSearchSuggestions(query, limitNum);
    }
    getPopularSearches(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.searchService.getPopularSearches(limitNum);
    }
    getBrands() {
        return this.searchService.getBrands();
    }
    searchAll(query, page, limit) {
        if (!query) {
            return {
                products: { products: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
                categories: { categories: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
                vendors: { vendors: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
                query: '',
            };
        }
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return Promise.all([
            this.searchService.searchProducts(query, {}, pageNum, limitNum),
            this.searchService.searchCategories(query, pageNum, limitNum),
            this.searchService.searchVendors(query, pageNum, limitNum),
        ]).then(([products, categories, vendors]) => ({
            products,
            categories,
            vendors,
            query,
        }));
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('minPrice')),
    __param(3, (0, common_1.Query)('maxPrice')),
    __param(4, (0, common_1.Query)('brand')),
    __param(5, (0, common_1.Query)('availability')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchCategories", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchVendors", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "getSearchSuggestions", null);
__decorate([
    (0, common_1.Get)('popular'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "getPopularSearches", null);
__decorate([
    (0, common_1.Get)('brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "searchAll", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map