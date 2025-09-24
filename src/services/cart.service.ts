import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            vendor: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const savedItems = await this.prisma.savedItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            vendor: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: cartItems,
      savedItems,
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity = 1 } = addToCartDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive || product.availability === 'OUT_OF_STOCK' || product.availability === 'DISCONTINUED') {
      throw new BadRequestException('Product is not available');
    }

    if (quantity > product.stockQuantity) {
      throw new BadRequestException(`Only ${product.stockQuantity} items available in stock`);
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        throw new BadRequestException(`Cannot add ${quantity} more items. Maximum available: ${product.stockQuantity - existingItem.quantity}`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              vendor: true,
              category: true,
            },
          },
        },
      });
    }

    // Remove from saved items if it exists
    await this.prisma.savedItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            vendor: true,
            category: true,
          },
        },
      },
    });
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity > cartItem.product.stockQuantity) {
      throw new BadRequestException(`Only ${cartItem.product.stockQuantity} items available in stock`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            vendor: true,
            category: true,
          },
        },
      },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  async moveToSaved(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    // Check if already saved
    const existingSavedItem = await this.prisma.savedItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: cartItem.productId,
        },
      },
    });

    if (!existingSavedItem) {
      await this.prisma.savedItem.create({
        data: {
          userId,
          productId: cartItem.productId,
        },
      });
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item moved to saved items' };
  }

  async moveToCart(userId: string, productId: string) {
    const savedItem = await this.prisma.savedItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    // Use the addToCart method to add to cart
    const cartItem = await this.addToCart(userId, { productId, quantity: 1 });

    // Remove from saved items
    await this.prisma.savedItem.delete({
      where: { id: savedItem.id },
    });

    return cartItem;
  }

  async removeSaved(userId: string, productId: string) {
    const savedItem = await this.prisma.savedItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    await this.prisma.savedItem.delete({
      where: { id: savedItem.id },
    });

    return { message: 'Item removed from saved items' };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { message: 'Cart cleared' };
  }

  async getCartSummary(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return {
      itemCount,
      subtotal,
      items: cartItems.length,
    };
  }
}