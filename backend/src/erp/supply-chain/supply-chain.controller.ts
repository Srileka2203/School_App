import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Inventory stock list' })
  async getInventory(@Query('workspaceId') workspaceId?: string) {
    return this.supplyChainService.getInventory(workspaceId);
  }

  @Get('shipments')
  @ApiOperation({ summary: 'Track outbound and inbound freight shipments' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Shipment tracking list' })
  async getShipments(@Query('workspaceId') workspaceId?: string) {
    return this.supplyChainService.getShipments(workspaceId);
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Dispatch a new logistics shipment' })
  async createShipment(@Body() body: any) {
    return this.supplyChainService.createShipment(body);
  }
}
