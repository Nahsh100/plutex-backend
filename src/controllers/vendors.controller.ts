import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VendorsService } from '../services/vendors.service';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyVendor(@Request() req) {
    // Prefer vendorId on the user payload if present, fallback to email lookup
    if (req.user?.vendorId) {
      return this.vendorsService.findOne(req.user.vendorId);
    }
    return this.vendorsService.findByEmail(req.user.email);
  }

  @Get('stats')
  getStats() {
    return this.vendorsService.getVendorsStats();
  }

  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    try {
      return await this.vendorsService.findByEmail(email);
    } catch (error) {
      // Return null instead of throwing error when vendor not found
      // This allows frontend to check vendor status without errors
      return null;
    }
  }

  @Get(':id/dashboard-stats')
  getVendorDashboardStats(@Param('id') id: string) {
    return this.vendorsService.getVendorDashboardStats(id);
  }

  @Get(':id/orders')
  getVendorOrders(@Param('id') id: string) {
    return this.vendorsService.getVendorOrders(id);
  }

  @Get(':id/revenue-stats')
  getVendorRevenueStats(@Param('id') id: string) {
    return this.vendorsService.getVendorRevenueStats(id);
  }

  @Get(':id/sales-by-category')
  getVendorSalesByCategory(@Param('id') id: string) {
    return this.vendorsService.getVendorSalesByCategory(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
