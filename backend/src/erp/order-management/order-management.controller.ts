import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderManagementService, ErpSalesOrderItem } from './order-management.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Order Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/order-management')
export class OrderManagementController {
  constructor(private readonly orderService: OrderManagementService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List all ERP sales/customer orders' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of sales orders' })
  async findAll(@Query('workspaceId') workspaceId?: string) {
    return this.orderService.findAll(workspaceId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get sales order details' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a new ERP order' })
  async create(@Body() body: any) {
    return this.orderService.create(body);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order fulfillment status' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ErpSalesOrderItem['status'],
  ) {
    return this.orderService.updateStatus(id, status);
  }
}
