import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { SearchService } from '../services/search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  searchProducts(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('brand') brand?: string,
    @Query('availability') availability?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
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

  @Get('categories')
  searchCategories(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      return { categories: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, query: '' };
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.searchService.searchCategories(query, pageNum, limitNum);
  }

  @Get('vendors')
  searchVendors(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      return { vendors: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, query: '' };
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.searchService.searchVendors(query, pageNum, limitNum);
  }

  @Get('suggestions')
  getSearchSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getSearchSuggestions(query, limitNum);
  }

  @Get('popular')
  getPopularSearches(
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getPopularSearches(limitNum);
  }

  @Get('brands')
  getBrands() {
    return this.searchService.getBrands();
  }

  @Get('all')
  searchAll(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
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
}
