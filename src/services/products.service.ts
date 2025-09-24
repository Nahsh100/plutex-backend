import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
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
      // Validate that vendor exists
      if (createProductDto.vendorId) {
        this.logger.debug(`[${createId}] Validating vendor: ${createProductDto.vendorId}`);
        const vendor = await this.prisma.vendor.findUnique({
          where: { id: createProductDto.vendorId }
        });

        if (!vendor) {
          this.logger.error(`[${createId}] Vendor not found: ${createProductDto.vendorId}`);
          throw new BadRequestException(`Vendor with ID ${createProductDto.vendorId} not found`);
        }

        this.logger.debug(`[${createId}] Vendor found: ${vendor.name} (${vendor.status})`);
      }

      // Validate that category exists
      if (createProductDto.categoryId) {
        this.logger.debug(`[${createId}] Validating category: ${createProductDto.categoryId}`);
        const category = await this.prisma.category.findUnique({
          where: { id: createProductDto.categoryId }
        });

        if (!category) {
          this.logger.error(`[${createId}] Category not found: ${createProductDto.categoryId}`);
          throw new BadRequestException(`Category with ID ${createProductDto.categoryId} not found`);
        }

        this.logger.debug(`[${createId}] Category found: ${category.name}`);
      }

      // Create the product
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

    } catch (error) {
      this.logger.error(`[${createId}] Product creation failed: ${error.message}`, error.stack);
      
      // Handle specific Prisma errors
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        this.logger.error(`[${createId}] Foreign key constraint violation:`, error.meta);
        throw new BadRequestException('Invalid vendor or category reference. Please check the provided IDs.');
      }
      
      // Re-throw other errors
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
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

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });
    
    return { message: 'Product deleted successfully' };
  }

  async findByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: {
        vendor: true,
        category: true,
      },
    });
  }

  async findByVendor(vendorId: string) {
    const products = await this.prisma.product.findMany({
      where: { vendorId },
      include: {
        vendor: true,
        category: true,
        orderItems: true,
      },
    });

    // Calculate actual sold count for each product
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
}
