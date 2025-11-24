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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_user_dto_1 = require("../dto/create-user.dto");
const bcrypt = require("bcrypt");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto) {
        const data = { ...createUserDto };
        if (createUserDto.password) {
            data.password = await bcrypt.hash(createUserDto.password, 10);
        }
        return this.prisma.user.create({
            data,
            include: {
                orders: true,
            },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                orders: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orders: true,
                reviews: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.logger.debug(`[${queryId}] UsersService.findByEmail() - Searching for user with email: ${email}`);
        try {
            const startTime = Date.now();
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            const duration = Date.now() - startTime;
            if (user) {
                this.logger.debug(`[${queryId}] User found - ID: ${user.id}, Role: ${user.role}, Status: ${user.status}, Query duration: ${duration}ms`);
                this.logger.debug(`[${queryId}] User details:`, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    hasPassword: !!user.password,
                    passwordHash: user.password ? `${user.password.substring(0, 10)}...` : null,
                    createdAt: user.createdAt,
                    duration: `${duration}ms`
                });
            }
            else {
                this.logger.debug(`[${queryId}] No user found for email: ${email}, Query duration: ${duration}ms`);
            }
            return user;
        }
        catch (error) {
            this.logger.error(`[${queryId}] Error finding user by email: ${email}`, error.stack);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        const data = { ...updateUserDto };
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            include: {
                orders: true,
                reviews: true,
            },
        });
    }
    async updateRole(id, role) {
        if (!Object.values(create_user_dto_1.UserRole).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: { role: role },
            include: {
                orders: true,
                reviews: true,
            },
        });
        this.logger.log(`User ${id} role updated to ${role}`);
        return user;
    }
    async remove(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async getUsersStats() {
        const [totalUsers, activeUsers, customers, vendors, totalRevenue] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: create_user_dto_1.UserStatus.ACTIVE } }),
            this.prisma.user.count({ where: { role: create_user_dto_1.UserRole.CUSTOMER } }),
            this.prisma.user.count({ where: { role: create_user_dto_1.UserRole.VENDOR } }),
            this.prisma.order.aggregate({
                where: { paymentStatus: 'PAID' },
                _sum: { total: true }
            }).then(result => result._sum.total || 0),
        ]);
        return {
            totalUsers,
            activeUsers,
            customers,
            vendors,
            totalRevenue,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map