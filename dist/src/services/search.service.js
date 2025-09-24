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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Fuse = (require('fuse.js').default ?? require('fuse.js'));
let SearchService = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchProducts(query, filters, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const allProductsWhere = {
            isActive: true,
        };
        if (filters?.categoryId) {
            allProductsWhere.categoryId = filters.categoryId;
        }
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            allProductsWhere.price = {};
            if (filters.minPrice !== undefined) {
                allProductsWhere.price.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                allProductsWhere.price.lte = filters.maxPrice;
            }
        }
        if (filters?.availability) {
            const normalizeAvailability = (value) => {
                const map = {
                    'in-stock': 'IN_STOCK',
                    'out-of-stock': 'OUT_OF_STOCK',
                    'limited': 'LOW_STOCK',
                    'low-stock': 'LOW_STOCK',
                    'discontinued': 'DISCONTINUED',
                };
                const lower = value.toLowerCase();
                return (map[lower] || value.toUpperCase().replace(/-/g, '_'));
            };
            allProductsWhere.availability = normalizeAvailability(filters.availability);
        }
        if (filters?.brand) {
            allProductsWhere.brand = { contains: filters.brand, mode: 'insensitive' };
        }
        const allProducts = await this.prisma.product.findMany({
            where: allProductsWhere,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                    },
                },
                reviews: {
                    where: {
                        status: 'APPROVED',
                    },
                    select: {
                        rating: true,
                    },
                },
            },
        });
        let filteredProducts = allProducts;
        if (query && query.trim()) {
            const fuseOptions = {
                keys: [
                    { name: 'name', weight: 0.4 },
                    { name: 'description', weight: 0.3 },
                    { name: 'brand', weight: 0.2 },
                    { name: 'category.name', weight: 0.1 },
                ],
                threshold: 0.8,
                includeScore: true,
                ignoreLocation: true,
                minMatchCharLength: 2,
                shouldSort: true,
            };
            const fuse = new Fuse(allProducts, fuseOptions);
            const fuseResults = fuse.search(query);
            filteredProducts = fuseResults.map(result => ({
                ...result.item,
                fuzzyScore: result.score,
            }));
        }
        const total = filteredProducts.length;
        if (filters?.sortBy && filters.sortBy !== 'relevance') {
            filteredProducts.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'price':
                        return filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
                    case 'rating':
                        return filters.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
                    case 'name':
                        return filters.sortOrder === 'desc'
                            ? b.name.localeCompare(a.name)
                            : a.name.localeCompare(b.name);
                    case 'popularity':
                        return filters.sortOrder === 'asc' ? a.soldCount - b.soldCount : b.soldCount - a.soldCount;
                    case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    default:
                        return 0;
                }
            });
        }
        else if (query && query.trim()) {
            filteredProducts.sort((a, b) => {
                const scoreA = a.fuzzyScore || 0;
                const scoreB = b.fuzzyScore || 0;
                return scoreA - scoreB;
            });
        }
        const paginatedProducts = filteredProducts.slice(skip, skip + limit);
        const productsWithRatings = paginatedProducts.map(product => ({
            ...product,
            averageRating: product.reviews.length > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
                : 0,
            reviewCount: product.reviews.length,
        }));
        return {
            products: productsWithRatings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            query,
            filters,
        };
    }
    async searchCategories(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            OR: [
                {
                    name: {
                        contains: query,
                    },
                },
                {
                    description: {
                        contains: query,
                    },
                },
            ],
        };
        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            products: {
                                where: {
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.category.count({ where }),
        ]);
        return {
            categories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            query,
        };
    }
    async searchVendors(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            status: 'ACTIVE',
            OR: [
                {
                    name: {
                        contains: query,
                    },
                },
                {
                    description: {
                        contains: query,
                    },
                },
            ],
        };
        const [vendors, total] = await Promise.all([
            this.prisma.vendor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { rating: 'desc' },
                include: {
                    _count: {
                        select: {
                            products: {
                                where: {
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.vendor.count({ where }),
        ]);
        return {
            vendors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            query,
        };
    }
    async getSearchSuggestions(query, limit = 10) {
        if (!query || query.length < 2) {
            return {
                products: [],
                categories: [],
                brands: [],
            };
        }
        const [products, categories, brands] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    isActive: true,
                    name: {
                        contains: query,
                    },
                },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    brand: true,
                },
                orderBy: { soldCount: 'desc' },
            }),
            this.prisma.category.findMany({
                where: {
                    isActive: true,
                    name: {
                        contains: query,
                    },
                },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.product.findMany({
                where: {
                    isActive: true,
                    brand: {
                        contains: query,
                    },
                },
                take: limit,
                select: {
                    brand: true,
                },
                distinct: ['brand'],
                orderBy: { brand: 'asc' },
            }),
        ]);
        return {
            products: products.map(p => ({ id: p.id, name: p.name, type: 'product' })),
            categories: categories.map(c => ({ id: c.id, name: c.name, type: 'category' })),
            brands: brands.map(b => ({ name: b.brand, type: 'brand' })),
        };
    }
    async getPopularSearches(limit = 10) {
        const [popularProducts, popularCategories] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    isActive: true,
                },
                take: limit,
                select: {
                    name: true,
                    soldCount: true,
                },
                orderBy: { soldCount: 'desc' },
            }),
            this.prisma.category.findMany({
                where: {
                    isActive: true,
                },
                take: limit,
                select: {
                    name: true,
                },
                orderBy: { name: 'asc' },
            }),
        ]);
        return {
            products: popularProducts.map(p => p.name),
            categories: popularCategories.map(c => c.name),
        };
    }
    async getBrands() {
        const brands = await this.prisma.product.findMany({
            where: {
                isActive: true,
                brand: {
                    not: null,
                },
            },
            select: {
                brand: true,
            },
            distinct: ['brand'],
            orderBy: { brand: 'asc' },
        });
        return brands.map(b => b.brand).filter(Boolean);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map