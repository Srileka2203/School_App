import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupplyChainService } from './supply-chain.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Supply Chain')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/supply-chain')
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'List current inventory stock levels across warehouses' })
  @ApiResponse({ status: 200, description: 'Inventory stock list' })
  async getInventory() {
    return this.supplyChainService.getInventory();
  }

  @Get('shipments')
  @ApiOperation({ summary: 'Track outbound and inbound freight shipments' })
  @ApiResponse({ status: 200, description: 'Shipment tracking list' })
  async getShipments() {
    return this.supplyChainService.getShipments();
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Dispatch a new logistics shipment' })
  async createShipment(@Body() body: any) {
    return this.supplyChainService.createShipment(body);
  }
}
