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

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update sales order details' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    return this.orderService.updateOrder(id, body);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order fulfillment status' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', example: 'PROCESSING', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'FULFILLED', 'CANCELLED'] } } } })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateStatus(id, status);
  }

  @Post('orders/:id/pay')
  @ApiOperation({ summary: 'Record payment for sales order' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  @ApiBody({ schema: { type: 'object', properties: { paymentStatus: { type: 'string', example: 'PAID', enum: ['PAID', 'UNPAID', 'PARTIAL'] } } } })
  async recordPayment(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.orderService.recordPayment(id, paymentStatus || 'PAID');
  }

  @Post('orders/:id/items')
  @ApiOperation({ summary: 'Add a line item to a sales order' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  @ApiBody({ schema: { type: 'object', properties: { productName: { type: 'string', example: 'Enterprise Server Rack' }, sku: { type: 'string', example: 'SRV-100' }, quantity: { type: 'number', example: 2 }, unitPrice: { type: 'number', example: 4500 } } } })
  async addOrderItem(@Param('id') id: string, @Body() item: any) {
    return this.orderService.addOrderItem(id, item);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Delete or cancel an ERP sales order' })
  @ApiParam({ name: 'id', description: 'Order ID or Number' })
  async removeOrder(@Param('id') id: string) {
    return this.orderService.removeOrder(id);
  }
}
