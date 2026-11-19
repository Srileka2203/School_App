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
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Manufacturing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/manufacturing')
export class ManufacturingController {
  constructor(private readonly manufacturingService: ManufacturingService) {}

  // --- WORK ORDERS ---
  @Get('work-orders')
  @ApiOperation({ summary: 'List shop-floor manufacturing work orders' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of work orders' })
  async getWorkOrders(@Query('workspaceId') workspaceId?: string) {
    return this.manufacturingService.getWorkOrders(workspaceId);
  }

  @Get('work-orders/:id')
  @ApiOperation({ summary: 'Get manufacturing work order details' })
  @ApiParam({ name: 'id', description: 'Work Order ID or Number' })
  async getWorkOrder(@Param('id') id: string) {
    return this.manufacturingService.getWorkOrder(id);
  }

  @Post('work-orders')
  @ApiOperation({ summary: 'Schedule a new manufacturing work order' })
  @ApiBody({ schema: { type: 'object', properties: { productName: { type: 'string', example: 'Heavy Industrial Turbine Vane X1' }, quantityTarget: { type: 'number', example: 50 }, productionLine: { type: 'string', example: 'Line 2 - CNC Milling' }, dueDate: { type: 'string', example: '2026-12-01' } } } })
  async createWorkOrder(@Body() body: any) {
    return this.manufacturingService.createWorkOrder(body);
  }

  @Patch('work-orders/:id')
  @ApiOperation({ summary: 'Update manufacturing progress or work order details' })
  @ApiParam({ name: 'id', description: 'Work Order ID or Number' })
  async updateWorkOrder(@Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.updateWorkOrder(id, body);
  }

  @Delete('work-orders/:id')
  @ApiOperation({ summary: 'Cancel or delete a work order' })
  @ApiParam({ name: 'id', description: 'Work Order ID or Number' })
  async removeWorkOrder(@Param('id') id: string) {
    return this.manufacturingService.removeWorkOrder(id);
  }

  // --- BILL OF MATERIALS (BOM) ---
  @Get('bom')
  @ApiOperation({ summary: 'List active Bills of Materials (BOM)' })
  @ApiQuery({ name: 'workspaceId', required: false })
  async getBOM(@Query('workspaceId') workspaceId?: string) {
    return this.manufacturingService.getBillOfMaterials(workspaceId);
  }

  @Get('bom/:id')
  @ApiOperation({ summary: 'Get Bill of Materials details with components' })
  @ApiParam({ name: 'id', description: 'BOM ID or Code' })
  async getBOMById(@Param('id') id: string) {
    return this.manufacturingService.getBOM(id);
  }

  @Post('bom')
  @ApiOperation({ summary: 'Create a new Bill of Materials' })
  @ApiBody({ schema: { type: 'object', properties: { assemblyName: { type: 'string', example: 'Hydraulic Actuator Pump Subsystem' }, version: { type: 'string', example: '2.0' }, components: { type: 'array', items: { type: 'object', properties: { componentName: { type: 'string' }, sku: { type: 'string' }, quantity: { type: 'number' }, unitOfMeasure: { type: 'string' }, costPerUnit: { type: 'number' } } } } } } })
  async createBOM(@Body() body: any) {
    return this.manufacturingService.createBOM(body);
  }

  @Patch('bom/:id')
  @ApiOperation({ summary: 'Update a Bill of Materials specification' })
  @ApiParam({ name: 'id', description: 'BOM ID or Code' })
  async updateBOM(@Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.updateBOM(id, body);
  }

  @Delete('bom/:id')
  @ApiOperation({ summary: 'Delete a Bill of Materials' })
  @ApiParam({ name: 'id', description: 'BOM ID or Code' })
  async removeBOM(@Param('id') id: string) {
    return this.manufacturingService.removeBOM(id);
  }
}
