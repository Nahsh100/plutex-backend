import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserWishlist(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWishlist(userId: string, productId: string) {
    // Ensure product exists
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const item = await this.prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
        include: { product: true },
      });
      return item;
    } catch (e) {
      throw new BadRequestException('Failed to add to wishlist');
    }
  }

  async removeFromWishlist(userId: string, productId: string) {
    try {
      await this.prisma.wishlistItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { success: true };
    } catch (e) {
      // Idempotent remove
      return { success: true };
    }
  }
}


