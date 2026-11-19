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
import { SupplyChainService } from './supply-chain.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Supply Chain')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/supply-chain')
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  // --- INVENTORY ---
  @Get('inventory')
  @ApiOperation({ summary: 'List current inventory stock levels across warehouses' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Inventory stock list' })
  async getInventory(@Query('workspaceId') workspaceId?: string) {
    return this.supplyChainService.getInventory(workspaceId);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Get inventory item details by ID or SKU' })
  @ApiParam({ name: 'id', description: 'Item ID or SKU' })
  async getInventoryItem(@Param('id') id: string) {
    return this.supplyChainService.getInventoryItem(id);
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Add a new inventory stock item' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Precision Stainless Steel Valve' }, sku: { type: 'string', example: 'SKU-VALVE-01' }, warehouseLocation: { type: 'string', example: 'Warehouse A - Bay 12' }, quantityOnHand: { type: 'number', example: 120 }, reorderLevel: { type: 'number', example: 30 }, unitPrice: { type: 'number', example: 75.5 } } } })
  async createInventory(@Body() body: any) {
    return this.supplyChainService.createInventory(body);
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory item attributes or stock levels' })
  @ApiParam({ name: 'id', description: 'Item ID or SKU' })
  async updateInventoryItem(@Param('id') id: string, @Body() body: any) {
    return this.supplyChainService.updateInventoryItem(id, body);
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Remove an inventory item' })
  @ApiParam({ name: 'id', description: 'Item ID or SKU' })
  async removeInventoryItem(@Param('id') id: string) {
    return this.supplyChainService.removeInventoryItem(id);
  }

  // --- SHIPMENTS ---
  @Get('shipments')
  @ApiOperation({ summary: 'Track outbound and inbound freight shipments' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Shipment tracking list' })
  async getShipments(@Query('workspaceId') workspaceId?: string) {
    return this.supplyChainService.getShipments(workspaceId);
  }

  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get shipment tracking details' })
  @ApiParam({ name: 'id', description: 'Shipment ID or Tracking Number' })
  async getShipment(@Param('id') id: string) {
    return this.supplyChainService.getShipment(id);
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Dispatch a new logistics shipment' })
  @ApiBody({ schema: { type: 'object', properties: { origin: { type: 'string', example: 'Chicago Distribution Center' }, destination: { type: 'string', example: 'Austin Assembly Plant' }, carrier: { type: 'string', example: 'FedEx Freight' }, trackingNumber: { type: 'string', example: 'TRK-98421045' } } } })
  async createShipment(@Body() body: any) {
    return this.supplyChainService.createShipment(body);
  }

  @Patch('shipments/:id/status')
  @ApiOperation({ summary: 'Update shipment transit status' })
  @ApiParam({ name: 'id', description: 'Shipment ID or Tracking Number' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', example: 'DELIVERED', enum: ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] }, actualArrival: { type: 'string', example: '2026-11-19T10:00:00Z' } } } })
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('actualArrival') actualArrival?: string,
  ) {
    return this.supplyChainService.updateShipmentStatus(id, status, actualArrival);
  }

  @Delete('shipments/:id')
  @ApiOperation({ summary: 'Delete or cancel a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID or Tracking Number' })
  async removeShipment(@Param('id') id: string) {
    return this.supplyChainService.removeShipment(id);
  }
}
