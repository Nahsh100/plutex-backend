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

  /**
   * Advanced search with fuzzy matching
   * Searches across product name, description, brand, and category name
   * Handles misspellings using case-insensitive partial matching
   */
  async search(query: string) {
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.logger.log(`[${searchId}] Searching products with query: "${query}"`);

    // Normalize the search query (lowercase, trim)
    const normalizedQuery = query.toLowerCase().trim();
    
    // Split query into words for better matching
    const searchWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    
    this.logger.debug(`[${searchId}] Search words:`, searchWords);

    try {
      // Get all products with related data
      const allProducts = await this.prisma.product.findMany({
        where: {
          isActive: true, // Only search active products
        },
        include: {
          vendor: true,
          category: true,
          reviews: true,
        },
      });

      this.logger.debug(`[${searchId}] Total active products: ${allProducts.length}`);

      // Filter and score products based on relevance
      const scoredProducts = allProducts
        .map(product => {
          let score = 0;
          const productName = (product.name || '').toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          const productBrand = (product.brand || '').toLowerCase();
          const categoryName = (product.category?.name || '').toLowerCase();

          // Check each search word
          searchWords.forEach(word => {
            // Exact matches get higher scores
            if (productName === word) score += 100;
            if (productBrand === word) score += 90;
            if (categoryName === word) score += 80;

            // Starts with match
            if (productName.startsWith(word)) score += 50;
            if (productBrand.startsWith(word)) score += 45;
            if (categoryName.startsWith(word)) score += 40;

            // Contains match (fuzzy matching for misspellings)
            if (productName.includes(word)) score += 30;
            if (productBrand.includes(word)) score += 25;
            if (categoryName.includes(word)) score += 20;
            if (productDesc.includes(word)) score += 10;

            // Levenshtein distance for typo tolerance (simple version)
            // Check if word is similar to product name words
            const nameWords = productName.split(/\s+/);
            const brandWords = productBrand.split(/\s+/);
            const categoryWords = categoryName.split(/\s+/);

            nameWords.forEach(nameWord => {
              if (this.isSimilar(word, nameWord)) score += 15;
            });
            brandWords.forEach(brandWord => {
              if (this.isSimilar(word, brandWord)) score += 12;
            });
            categoryWords.forEach(catWord => {
              if (this.isSimilar(word, catWord)) score += 10;
            });
          });

          return { product, score };
        })
        .filter(item => item.score > 0) // Only include products with matches
        .sort((a, b) => b.score - a.score) // Sort by relevance score
        .map(item => item.product); // Extract products

      this.logger.log(`[${searchId}] Found ${scoredProducts.length} matching products`);
      
      if (scoredProducts.length > 0) {
        this.logger.debug(`[${searchId}] Top 3 results:`, 
          scoredProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name, brand: p.brand }))
        );
      }

      return scoredProducts;

    } catch (error) {
      this.logger.error(`[${searchId}] Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Simple similarity check for typo tolerance
   * Returns true if strings are similar (allowing 1-2 character differences)
   */
  private isSimilar(str1: string, str2: string): boolean {
    if (str1 === str2) return true;
    if (Math.abs(str1.length - str2.length) > 2) return false;
    if (str1.length < 3 || str2.length < 3) return false;

    // Calculate simple edit distance
    const maxLength = Math.max(str1.length, str2.length);
    let differences = 0;

    for (let i = 0; i < maxLength; i++) {
      if (str1[i] !== str2[i]) differences++;
      if (differences > 2) return false; // Allow up to 2 character differences
    }

    return differences <= 2;
  }
}
