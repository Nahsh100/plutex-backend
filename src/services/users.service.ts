import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserRole, UserStatus } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        reviews: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
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
      } else {
        this.logger.debug(`[${queryId}] No user found for email: ${email}, Query duration: ${duration}ms`);
      }

      return user;
    } catch (error) {
      this.logger.error(`[${queryId}] Error finding user by email: ${email}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
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

  async updateRole(id: string, role: string) {
    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as UserRole },
      include: {
        orders: true,
        reviews: true,
      },
    });

    this.logger.log(`User ${id} role updated to ${role}`);
    
    // Note: To sync with Clerk, you would need to use Clerk's Backend API
    // Example (requires @clerk/backend package):
    // import { clerkClient } from '@clerk/backend';
    // await clerkClient.users.updateUserMetadata(id, {
    //   publicMetadata: { role }
    // });
    
    return user;
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getUsersStats() {
    const [totalUsers, activeUsers, customers, vendors, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.user.count({ where: { role: UserRole.VENDOR } }),
      // Calculate total revenue from all paid orders
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
}
