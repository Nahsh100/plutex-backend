"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_service_1 = require("./services/users.service");
const products_service_1 = require("./services/products.service");
const vendors_service_1 = require("./services/vendors.service");
const orders_service_1 = require("./services/orders.service");
const categories_service_1 = require("./services/categories.service");
const auth_service_1 = require("./services/auth.service");
const email_service_1 = require("./services/email.service");
const reviews_service_1 = require("./services/reviews.service");
const search_service_1 = require("./services/search.service");
const notifications_service_1 = require("./services/notifications.service");
const websocket_service_1 = require("./services/websocket.service");
const payouts_service_1 = require("./services/payouts.service");
const config_service_1 = require("./services/config.service");
const cart_service_1 = require("./services/cart.service");
const users_controller_1 = require("./controllers/users.controller");
const products_controller_1 = require("./controllers/products.controller");
const vendors_controller_1 = require("./controllers/vendors.controller");
const orders_controller_1 = require("./controllers/orders.controller");
const categories_controller_1 = require("./controllers/categories.controller");
const auth_controller_1 = require("./controllers/auth.controller");
const payments_controller_1 = require("./controllers/payments.controller");
const wishlist_controller_1 = require("./controllers/wishlist.controller");
const reviews_controller_1 = require("./controllers/reviews.controller");
const search_controller_1 = require("./controllers/search.controller");
const notifications_controller_1 = require("./controllers/notifications.controller");
const payouts_controller_1 = require("./controllers/payouts.controller");
const config_controller_1 = require("./controllers/config.controller");
const earnings_controller_1 = require("./controllers/earnings.controller");
const cart_controller_1 = require("./controllers/cart.controller");
const jwt_strategy_1 = require("./guards/jwt.strategy");
const google_strategy_1 = require("./guards/google.strategy");
const wishlist_service_1 = require("./services/wishlist.service");
const notifications_gateway_1 = require("./gateways/notifications.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
                signOptions: { expiresIn: '15m' },
            }),
            prisma_module_1.PrismaModule,
        ],
        controllers: [
            app_controller_1.AppController,
            users_controller_1.UsersController,
            products_controller_1.ProductsController,
            vendors_controller_1.VendorsController,
            orders_controller_1.OrdersController,
            categories_controller_1.CategoriesController,
            auth_controller_1.AuthController,
            payments_controller_1.PaymentsController,
            wishlist_controller_1.WishlistController,
            reviews_controller_1.ReviewsController,
            search_controller_1.SearchController,
            notifications_controller_1.NotificationsController,
            payouts_controller_1.PayoutsController,
            config_controller_1.ConfigController,
            earnings_controller_1.EarningsController,
            cart_controller_1.CartController,
        ],
        providers: [
            app_service_1.AppService,
            users_service_1.UsersService,
            products_service_1.ProductsService,
            vendors_service_1.VendorsService,
            orders_service_1.OrdersService,
            categories_service_1.CategoriesService,
            auth_service_1.AuthService,
            email_service_1.EmailService,
            reviews_service_1.ReviewsService,
            search_service_1.SearchService,
            notifications_service_1.NotificationsService,
            websocket_service_1.WebSocketService,
            payouts_service_1.PayoutsService,
            config_service_1.ConfigService,
            cart_service_1.CartService,
            notifications_gateway_1.NotificationsGateway,
            jwt_strategy_1.JwtStrategy,
            google_strategy_1.GoogleStrategy,
            wishlist_service_1.WishlistService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map