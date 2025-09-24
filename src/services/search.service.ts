import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type FuseType from 'fuse.js';
// Support both CJS and ESM builds of fuse.js at runtime
const Fuse: typeof FuseType = (require('fuse.js').default ?? require('fuse.js'));

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchProducts(query: string, filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    availability?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // First, get all active products to apply fuzzy search
    const allProductsWhere: any = {
      isActive: true,
    };

    // Apply non-text filters first
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
      // Normalize availability to enum codes
      const normalizeAvailability = (value: string) => {
        const map: Record<string, string> = {
          'in-stock': 'IN_STOCK',
          'out-of-stock': 'OUT_OF_STOCK',
          'limited': 'LOW_STOCK',
          'low-stock': 'LOW_STOCK',
          'discontinued': 'DISCONTINUED',
        };
        const lower = value.toLowerCase();
        return (map[lower] || value.toUpperCase().replace(/-/g, '_')) as any;
      };
      allProductsWhere.availability = normalizeAvailability(filters.availability);
    }

    // Apply strict brand filtering (case-insensitive)
    if (filters?.brand) {
      allProductsWhere.brand = { contains: filters.brand, mode: 'insensitive' };
    }

    // Get all products that match non-text filters
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

    // Extend the product type to carry fuzzy match score during processing
    type SearchProduct = (typeof allProducts) extends Array<infer T>
      ? T & { fuzzyScore?: number }
      : never;

    let filteredProducts: SearchProduct[] = allProducts as unknown as SearchProduct[];

    // Apply fuzzy search if query is provided
    if (query && query.trim()) {
      // Configure Fuse.js for fuzzy search
      const fuseOptions = {
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'brand', weight: 0.2 },
          { name: 'category.name', weight: 0.1 },
        ],
        threshold: 0.8, // 0.0 = perfect match, 1.0 = match anything
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
        shouldSort: true,
      };

      const fuse = new Fuse(allProducts, fuseOptions);
      const fuseResults = fuse.search(query);

      // Extract products from Fuse results and add fuzzy score
      filteredProducts = fuseResults.map(result => ({
        ...result.item,
        fuzzyScore: result.score,
      })) as unknown as SearchProduct[];

      // Optional: if brand was provided, we already filtered by brand in DB query.
      // We can still slightly boost brand matches inside the filtered set if needed.
    }

    const total = filteredProducts.length;

    // Apply sorting to filtered products
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
    } else if (query && query.trim()) {
      // Sort by fuzzy search relevance (lower score = better match)
      filteredProducts.sort((a, b) => {
        const scoreA = (a as any).fuzzyScore || 0;
        const scoreB = (b as any).fuzzyScore || 0;
        return scoreA - scoreB;
      });
    }

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    // Calculate average ratings for products
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

  async searchCategories(query: string, page: number = 1, limit: number = 20) {
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

  async searchVendors(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
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

  async getSearchSuggestions(query: string, limit: number = 10) {
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

  async getPopularSearches(limit: number = 10) {
    // This would typically be stored in a separate table for search analytics
    // For now, we'll return popular product names and categories
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
}
