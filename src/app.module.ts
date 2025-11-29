import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Prisma
import { PrismaModule } from './prisma/prisma.module';

// Services
import { UsersService } from './services/users.service';
import { ProductsService } from './services/products.service';
import { VendorsService } from './services/vendors.service';
import { OrdersService } from './services/orders.service';
import { CategoriesService } from './services/categories.service';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { ReviewsService } from './services/reviews.service';
import { SearchService } from './services/search.service';
import { NotificationsService } from './services/notifications.service';
import { WebSocketService } from './services/websocket.service';
import { PayoutsService } from './services/payouts.service';
import { ConfigService } from './services/config.service';
import { CartService } from './services/cart.service';
import { MoneyUnifyService } from './services/moneyunify.service';

// Controllers
import { UsersController } from './controllers/users.controller';
import { ProductsController } from './controllers/products.controller';
import { VendorsController } from './controllers/vendors.controller';
import { OrdersController } from './controllers/orders.controller';
import { CategoriesController } from './controllers/categories.controller';
import { AuthController } from './controllers/auth.controller';
import { PaymentsController } from './controllers/payments.controller';
import { MoneyUnifyController } from './controllers/moneyunify.controller';
import { WishlistController } from './controllers/wishlist.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { SearchController } from './controllers/search.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { PayoutsController } from './controllers/payouts.controller';
import { ConfigController } from './controllers/config.controller';
import { EarningsController } from './controllers/earnings.controller';
import { CartController } from './controllers/cart.controller';

// Guards
import { JwtStrategy } from './guards/jwt.strategy';
import { GoogleStrategy } from './guards/google.strategy';
import { WishlistService } from './services/wishlist.service';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
  ],
  controllers: [
    AppController,
    UsersController,
    ProductsController,
    VendorsController,
    OrdersController,
    CategoriesController,
    AuthController,
    PaymentsController,
    MoneyUnifyController,
    WishlistController,
    ReviewsController,
    SearchController,
    NotificationsController,
    PayoutsController,
    ConfigController,
    EarningsController,
    CartController,
  ],
  providers: [
    AppService,
    UsersService,
    ProductsService,
    VendorsService,
    OrdersService,
    CategoriesService,
    AuthService,
    EmailService,
    ReviewsService,
    SearchService,
    NotificationsService,
    WebSocketService,
    PayoutsService,
    ConfigService,
    CartService,
    MoneyUnifyService,
    NotificationsGateway,
    JwtStrategy,
    GoogleStrategy,
    WishlistService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
