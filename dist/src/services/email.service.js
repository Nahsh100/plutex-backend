"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const PDFDocument = require("pdfkit");
let EmailService = class EmailService {
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY not set. Email functionality will be disabled.');
        }
        this.resend = new resend_1.Resend(apiKey);
        this.fromEmail = process.env.FROM_EMAIL || 'orders@plutex.com';
    }
    async generateOrderReceipt(order) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('PLUTEX', { align: 'center' });
            doc.fontSize(10).text('Order Receipt', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`Order Number: ${order.orderNumber}`);
            doc.fontSize(10).text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
            doc.text(`Payment Status: ${order.paymentStatus}`);
            doc.text(`Order Status: ${order.status}`);
            doc.moveDown();
            doc.fontSize(12).text('Customer Information:', { underline: true });
            const shippingAddr = order.shippingAddress;
            if (shippingAddr) {
                doc.fontSize(10).text(`Name: ${shippingAddr.fullName || 'N/A'}`);
                doc.text(`Email: ${shippingAddr.email || order.user?.email || 'N/A'}`);
                doc.text(`Phone: ${shippingAddr.phone || 'N/A'}`);
                doc.text(`Address: ${shippingAddr.address || 'N/A'}`);
                doc.text(`City: ${shippingAddr.city || 'N/A'}, ${shippingAddr.state || ''} ${shippingAddr.zipCode || ''}`);
                doc.text(`Country: ${shippingAddr.country || 'N/A'}`);
            }
            doc.moveDown();
            doc.fontSize(12).text('Order Items:', { underline: true });
            doc.moveDown(0.5);
            const tableTop = doc.y;
            const itemX = 50;
            const qtyX = 300;
            const priceX = 370;
            const totalX = 450;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Item', itemX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('Price', priceX, tableTop);
            doc.text('Total', totalX, tableTop);
            doc.moveTo(itemX, tableTop + 15).lineTo(530, tableTop + 15).stroke();
            doc.font('Helvetica');
            let currentY = tableTop + 25;
            if (order.items && order.items.length > 0) {
                order.items.forEach((item) => {
                    const itemTotal = item.price * item.quantity;
                    doc.text(item.product?.name || 'Product', itemX, currentY, { width: 240 });
                    doc.text(item.quantity.toString(), qtyX, currentY);
                    doc.text(`K${item.price.toFixed(2)}`, priceX, currentY);
                    doc.text(`K${itemTotal.toFixed(2)}`, totalX, currentY);
                    currentY += 25;
                });
            }
            doc.moveTo(itemX, currentY).lineTo(530, currentY).stroke();
            currentY += 15;
            doc.font('Helvetica');
            doc.text('Subtotal:', priceX, currentY);
            doc.text(`K${order.subtotal.toFixed(2)}`, totalX, currentY);
            currentY += 20;
            doc.text('Tax:', priceX, currentY);
            doc.text(`K${order.tax.toFixed(2)}`, totalX, currentY);
            currentY += 20;
            doc.text('Shipping:', priceX, currentY);
            doc.text(`K${order.shippingCost.toFixed(2)}`, totalX, currentY);
            currentY += 20;
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('Total:', priceX, currentY);
            doc.text(`K${order.total.toFixed(2)}`, totalX, currentY);
            doc.moveDown(3);
            doc.fontSize(10).font('Helvetica').text('Thank you for your order!', { align: 'center' });
            doc.fontSize(8).text('For questions about your order, please contact support@plutex.com', { align: 'center' });
            doc.end();
        });
    }
    async sendCustomerOrderConfirmation(order, customerEmail) {
        try {
            const pdfReceipt = await this.generateOrderReceipt(order);
            const itemsList = order.items
                ?.map((item) => `<li>${item.product?.name || 'Product'} x ${item.quantity} - K${(item.price * item.quantity).toFixed(2)}</li>`)
                .join('');
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi ${order.shippingAddress?.fullName || 'Customer'},</p>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              
              <div class="order-details">
                <h2>Order #${order.orderNumber}</h2>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                <p><strong>Order Status:</strong> ${order.status}</p>
                
                <h3>Items Ordered:</h3>
                <ul>
                  ${itemsList}
                </ul>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                  <p><strong>Subtotal:</strong> K${order.subtotal.toFixed(2)}</p>
                  <p><strong>Tax:</strong> K${order.tax.toFixed(2)}</p>
                  <p><strong>Shipping:</strong> K${order.shippingCost.toFixed(2)}</p>
                  <p style="font-size: 18px;"><strong>Total:</strong> K${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://plutex.com'}/shop/orders/${order.id}/track" class="button">
                  Track Your Order
                </a>
              </p>
              
              <p>You can track your order status at any time by visiting your orders page.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact us at support@plutex.com</p>
              <p>&copy; ${new Date().getFullYear()} Plutex. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: customerEmail,
                subject: `Order Confirmation - ${order.orderNumber}`,
                html,
                attachments: [
                    {
                        filename: `receipt-${order.orderNumber}.pdf`,
                        content: pdfReceipt,
                    },
                ],
            });
            console.log(`Order confirmation email sent to customer: ${customerEmail}`);
        }
        catch (error) {
            console.error('Error sending customer order confirmation:', error);
            throw error;
        }
    }
    async sendVendorOrderNotification(order, vendorEmail, vendorItems) {
        try {
            const itemsList = vendorItems
                .map((item) => `<li>${item.product?.name || 'Product'} x ${item.quantity} - K${(item.price * item.quantity).toFixed(2)}</li>`)
                .join('');
            const vendorTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .alert { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Order Received</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have received a new order containing your products!</p>
              
              <div class="alert">
                <strong>⚠️ Action Required:</strong> Please prepare these items for shipment.
              </div>
              
              <div class="order-details">
                <h2>Order #${order.orderNumber}</h2>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                
                <h3>Your Items in This Order:</h3>
                <ul>
                  ${itemsList}
                </ul>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                  <p style="font-size: 18px;"><strong>Your Total:</strong> K${vendorTotal.toFixed(2)}</p>
                </div>
                
                <h3>Shipping Information:</h3>
                <p>
                  ${order.shippingAddress?.fullName || 'N/A'}<br>
                  ${order.shippingAddress?.address || 'N/A'}<br>
                  ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}<br>
                  ${order.shippingAddress?.country || 'N/A'}<br>
                  Phone: ${order.shippingAddress?.phone || 'N/A'}
                </p>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://plutex.com'}/orders" class="button">
                  Manage Order
                </a>
              </p>
              
              <p>Please update the order status once you've shipped the items.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact us at vendor-support@plutex.com</p>
              <p>&copy; ${new Date().getFullYear()} Plutex. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: vendorEmail,
                subject: `New Order - ${order.orderNumber}`,
                html,
            });
            console.log(`Order notification email sent to vendor: ${vendorEmail}`);
        }
        catch (error) {
            console.error('Error sending vendor order notification:', error);
            throw error;
        }
    }
    async sendEmailVerification(email, token) {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'https://plutex.com'}/verify-email?token=${token}`;
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Thank you for registering with Plutex!</p>
              <p>Please click the button below to verify your email address:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Plutex. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Verify Your Email - Plutex',
                html,
            });
            console.log(`Email verification sent to: ${email}`);
        }
        catch (error) {
            console.error('Error sending email verification:', error);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, token) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'https://plutex.com'}/reset-password?token=${token}`;
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>We received a request to reset your password for your Plutex account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact us at support@plutex.com</p>
              <p>&copy; ${new Date().getFullYear()} Plutex. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Password Reset - Plutex',
                html,
            });
            console.log(`Password reset email sent to: ${email}`);
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }
    async sendOrderStatusUpdate(order, customerEmail, oldStatus, newStatus) {
        try {
            const statusMessages = {
                PROCESSING: 'Your order is being processed and will be shipped soon.',
                SHIPPED: 'Your order has been shipped! It should arrive within 3-5 business days.',
                DELIVERED: 'Your order has been delivered. We hope you enjoy your purchase!',
                CANCELLED: 'Your order has been cancelled. If you have any questions, please contact support.',
            };
            const message = statusMessages[newStatus] || 'Your order status has been updated.';
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .status-update { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; text-align: center; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .status-shipped { background: #dbeafe; color: #1e40af; }
            .status-delivered { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Update</h1>
            </div>
            <div class="content">
              <p>Hi ${order.shippingAddress?.fullName || 'Customer'},</p>
              
              <div class="status-update">
                <h2>Order #${order.orderNumber}</h2>
                <p>Status changed from <strong>${oldStatus}</strong> to:</p>
                <p><span class="status-badge status-${newStatus.toLowerCase()}">${newStatus}</span></p>
                <p style="margin-top: 20px;">${message}</p>
                ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://plutex.com'}/shop/orders/${order.id}/track" class="button">
                  Track Your Order
                </a>
              </p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact us at support@plutex.com</p>
              <p>&copy; ${new Date().getFullYear()} Plutex. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: customerEmail,
                subject: `Order Update - ${order.orderNumber} is now ${newStatus}`,
                html,
            });
            console.log(`Order status update email sent to: ${customerEmail}`);
        }
        catch (error) {
            console.error('Error sending order status update:', error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map