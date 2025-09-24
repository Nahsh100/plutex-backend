import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId);
  }

  @Get('summary')
  getCartSummary(@Request() req: any) {
    const userId = req.user?.id;
    return this.cartService.getCartSummary(userId);
  }

  @Post('add')
  addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user?.id;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateCartItem(userId, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  removeFromCart(@Request() req: any, @Param('itemId') itemId: string) {
    const userId = req.user?.id;
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Post('items/:itemId/save')
  moveToSaved(@Request() req: any, @Param('itemId') itemId: string) {
    const userId = req.user?.id;
    return this.cartService.moveToSaved(userId, itemId);
  }

  @Post('saved/:productId/move-to-cart')
  moveToCart(@Request() req: any, @Param('productId') productId: string) {
    const userId = req.user?.id;
    return this.cartService.moveToCart(userId, productId);
  }

  @Delete('saved/:productId')
  removeSaved(@Request() req: any, @Param('productId') productId: string) {
    const userId = req.user?.id;
    return this.cartService.removeSaved(userId, productId);
  }

  @Delete('clear')
  clearCart(@Request() req: any) {
    const userId = req.user?.id;
    return this.cartService.clearCart(userId);
  }
}