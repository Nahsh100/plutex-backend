-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'VENDOR');

-- CreateEnum
CREATE TYPE "public"."VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ProductAvailability" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "refreshToken" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."VendorStatus" NOT NULL DEFAULT 'PENDING',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "logo" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "brand" TEXT NOT NULL,
    "images" JSONB,
    "specifications" JSONB,
    "availability" "public"."ProductAvailability" NOT NULL DEFAULT 'IN_STOCK',
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "shippingMethod" TEXT NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorOrderId" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_orders" (
    "id" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "vendor_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_commissions" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "vendor_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT,
    "vendorOrderId" TEXT,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_payouts" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "reference" TEXT,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "vendor_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_config" (
    "id" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlist_items" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isPush" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "public"."users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "public"."vendors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "public"."orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_commissions_vendorId_key" ON "public"."vendor_commissions"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_reference_key" ON "public"."payment_transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "public"."wishlist_items"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "public"."email_verification_tokens"("token");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "public"."vendor_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_orders" ADD CONSTRAINT "vendor_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_orders" ADD CONSTRAINT "vendor_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_commissions" ADD CONSTRAINT "vendor_commissions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_vendorOrderId_fkey" FOREIGN KEY ("vendorOrderId") REFERENCES "public"."vendor_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_payouts" ADD CONSTRAINT "vendor_payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
