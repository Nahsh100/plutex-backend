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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    async create(createProductDto) {
        const createId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.logger.log(`[${createId}] Creating product: ${createProductDto.name}`);
        this.logger.debug(`[${createId}] Product data:`, {
            name: createProductDto.name,
            price: createProductDto.price,
            vendorId: createProductDto.vendorId,
            categoryId: createProductDto.categoryId,
            stockQuantity: createProductDto.stockQuantity,
        });
        try {
            if (createProductDto.vendorId) {
                this.logger.debug(`[${createId}] Validating vendor: ${createProductDto.vendorId}`);
                const vendor = await this.prisma.vendor.findUnique({
                    where: { id: createProductDto.vendorId }
                });
                if (!vendor) {
                    this.logger.error(`[${createId}] Vendor not found: ${createProductDto.vendorId}`);
                    throw new common_1.BadRequestException(`Vendor with ID ${createProductDto.vendorId} not found`);
                }
                this.logger.debug(`[${createId}] Vendor found: ${vendor.name} (${vendor.status})`);
            }
            if (createProductDto.categoryId) {
                this.logger.debug(`[${createId}] Validating category: ${createProductDto.categoryId}`);
                const category = await this.prisma.category.findUnique({
                    where: { id: createProductDto.categoryId }
                });
                if (!category) {
                    this.logger.error(`[${createId}] Category not found: ${createProductDto.categoryId}`);
                    throw new common_1.BadRequestException(`Category with ID ${createProductDto.categoryId} not found`);
                }
                this.logger.debug(`[${createId}] Category found: ${category.name}`);
            }
            this.logger.debug(`[${createId}] Creating product in database`);
            const product = await this.prisma.product.create({
                data: createProductDto,
                include: {
                    vendor: true,
                    category: true,
                    reviews: true,
                },
            });
            this.logger.log(`[${createId}] Product created successfully: ${product.id} - ${product.name}`);
            this.logger.debug(`[${createId}] Created product details:`, {
                id: product.id,
                name: product.name,
                price: product.price,
                vendorName: product.vendor.name,
                categoryName: product.category.name,
                stockQuantity: product.stockQuantity,
            });
            return product;
        }
        catch (error) {
            this.logger.error(`[${createId}] Product creation failed: ${error.message}`, error.stack);
            if (error.code === 'P2003') {
                this.logger.error(`[${createId}] Foreign key constraint violation:`, error.meta);
                throw new common_1.BadRequestException('Invalid vendor or category reference. Please check the provided IDs.');
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: {
                vendor: true,
                category: true,
                reviews: true,
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                vendor: true,
                category: true,
                reviews: true,
                orderItems: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                vendor: true,
                category: true,
                reviews: true,
            },
        });
    }
    async remove(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        await this.prisma.product.delete({
            where: { id },
        });
        return { message: 'Product deleted successfully' };
    }
    async findByCategory(categoryId) {
        return this.prisma.product.findMany({
            where: { categoryId },
            include: {
                vendor: true,
                category: true,
            },
        });
    }
    async findByVendor(vendorId) {
        const products = await this.prisma.product.findMany({
            where: { vendorId },
            include: {
                vendor: true,
                category: true,
                orderItems: true,
            },
        });
        return products.map(product => ({
            ...product,
            soldCount: product.orderItems.reduce((total, item) => total + item.quantity, 0)
        }));
    }
    async getProductsStats() {
        const [totalProducts, activeProducts, featuredProducts, outOfStockProducts] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.product.count({ where: { isActive: true } }),
            this.prisma.product.count({ where: { isFeatured: true } }),
            this.prisma.product.count({ where: { availability: 'OUT_OF_STOCK' } }),
        ]);
        return {
            totalProducts,
            activeProducts,
            featuredProducts,
            outOfStockProducts,
        };
    }
    async search(query) {
        const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.logger.log(`[${searchId}] Searching products with query: "${query}"`);
        const normalizedQuery = query.toLowerCase().trim();
        const searchWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
        this.logger.debug(`[${searchId}] Search words:`, searchWords);
        try {
            const allProducts = await this.prisma.product.findMany({
                where: {
                    isActive: true,
                },
                include: {
                    vendor: true,
                    category: true,
                    reviews: true,
                },
            });
            this.logger.debug(`[${searchId}] Total active products: ${allProducts.length}`);
            const scoredProducts = allProducts
                .map(product => {
                let score = 0;
                const productName = (product.name || '').toLowerCase();
                const productDesc = (product.description || '').toLowerCase();
                const productBrand = (product.brand || '').toLowerCase();
                const categoryName = (product.category?.name || '').toLowerCase();
                searchWords.forEach(word => {
                    if (productName === word)
                        score += 100;
                    if (productBrand === word)
                        score += 90;
                    if (categoryName === word)
                        score += 80;
                    if (productName.startsWith(word))
                        score += 50;
                    if (productBrand.startsWith(word))
                        score += 45;
                    if (categoryName.startsWith(word))
                        score += 40;
                    if (productName.includes(word))
                        score += 30;
                    if (productBrand.includes(word))
                        score += 25;
                    if (categoryName.includes(word))
                        score += 20;
                    if (productDesc.includes(word))
                        score += 10;
                    const nameWords = productName.split(/\s+/);
                    const brandWords = productBrand.split(/\s+/);
                    const categoryWords = categoryName.split(/\s+/);
                    nameWords.forEach(nameWord => {
                        if (this.isSimilar(word, nameWord))
                            score += 15;
                    });
                    brandWords.forEach(brandWord => {
                        if (this.isSimilar(word, brandWord))
                            score += 12;
                    });
                    categoryWords.forEach(catWord => {
                        if (this.isSimilar(word, catWord))
                            score += 10;
                    });
                });
                return { product, score };
            })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.product);
            this.logger.log(`[${searchId}] Found ${scoredProducts.length} matching products`);
            if (scoredProducts.length > 0) {
                this.logger.debug(`[${searchId}] Top 3 results:`, scoredProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name, brand: p.brand })));
            }
            return scoredProducts;
        }
        catch (error) {
            this.logger.error(`[${searchId}] Search failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    isSimilar(str1, str2) {
        if (str1 === str2)
            return true;
        if (Math.abs(str1.length - str2.length) > 2)
            return false;
        if (str1.length < 3 || str2.length < 3)
            return false;
        const maxLength = Math.max(str1.length, str2.length);
        let differences = 0;
        for (let i = 0; i < maxLength; i++) {
            if (str1[i] !== str2[i])
                differences++;
            if (differences > 2)
                return false;
        }
        return differences <= 2;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map