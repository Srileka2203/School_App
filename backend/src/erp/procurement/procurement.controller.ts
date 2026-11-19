import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Procurement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  // --- PURCHASE ORDERS ---
  @Get('orders')
  @ApiOperation({ summary: 'List all procurement purchase orders' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of purchase orders' })
  async findAll(@Query('workspaceId') workspaceId?: string) {
    return this.procurementService.findAll(workspaceId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get purchase order details' })
  @ApiParam({ name: 'id', description: 'PO ID or Number' })
  async findOne(@Param('id') id: string) {
    return this.procurementService.findOne(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a new purchase order' })
  async create(@Body() body: any) {
    return this.procurementService.create(body);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update purchase order details' })
  @ApiParam({ name: 'id', description: 'PO ID or Number' })
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    return this.procurementService.updateOrder(id, body);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Delete or cancel a purchase order' })
  @ApiParam({ name: 'id', description: 'PO ID or Number' })
  async removeOrder(@Param('id') id: string) {
    return this.procurementService.removeOrder(id);
  }

  @Post('orders/:id/items')
  @ApiOperation({ summary: 'Add a line item to a purchase order' })
  @ApiParam({ name: 'id', description: 'PO ID or Number' })
  @ApiBody({ schema: { type: 'object', properties: { itemName: { type: 'string', example: 'Raw Steel Alloy' }, sku: { type: 'string', example: 'STL-400' }, quantity: { type: 'number', example: 50 }, unitPrice: { type: 'number', example: 120 } } } })
  async addOrderItem(@Param('id') id: string, @Body() item: any) {
    return this.procurementService.addOrderItem(id, item);
  }

  // --- VENDORS ---
  @Get('vendors')
  @ApiOperation({ summary: 'List approved suppliers and vendors' })
  @ApiQuery({ name: 'workspaceId', required: false })
  async getVendors(@Query('workspaceId') workspaceId?: string) {
    return this.procurementService.getVendors(workspaceId);
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'Get vendor details by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async getVendor(@Param('id') id: string) {
    return this.procurementService.getVendor(id);
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Onboard and create a new vendor' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Apex Raw Materials Ltd' }, email: { type: 'string', example: 'sales@apexraw.com' }, phone: { type: 'string', example: '+1-555-0199' }, address: { type: 'string', example: 'Chicago, IL' }, rating: { type: 'number', example: 4.8 } } } })
  async createVendor(@Body() body: any) {
    return this.procurementService.createVendor(body);
  }

  @Patch('vendors/:id')
  @ApiOperation({ summary: 'Update vendor profile' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async updateVendor(@Param('id') id: string, @Body() body: any) {
    return this.procurementService.updateVendor(id, body);
  }

  @Delete('vendors/:id')
  @ApiOperation({ summary: 'Remove a vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async removeVendor(@Param('id') id: string) {
    return this.procurementService.removeVendor(id);
  }
}
