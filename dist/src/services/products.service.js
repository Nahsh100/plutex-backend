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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map