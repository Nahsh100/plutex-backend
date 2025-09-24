import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getMyWishlist(@Request() req) {
    return this.wishlistService.getUserWishlist(req.user.id);
  }

  @Post(':productId')
  async add(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  async remove(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }
}


