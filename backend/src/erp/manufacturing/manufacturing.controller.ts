import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Manufacturing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/manufacturing')
export class ManufacturingController {
  constructor(private readonly manufacturingService: ManufacturingService) {}

  @Get('work-orders')
  @ApiOperation({ summary: 'List shop-floor manufacturing work orders' })
  @ApiResponse({ status: 200, description: 'List of work orders' })
  async getWorkOrders() {
    return this.manufacturingService.getWorkOrders();
  }

  @Post('work-orders')
  @ApiOperation({ summary: 'Schedule a new manufacturing work order' })
  async createWorkOrder(@Body() body: any) {
    return this.manufacturingService.createWorkOrder(body);
  }

  @Get('bom')
  @ApiOperation({ summary: 'List active Bills of Materials (BOM)' })
  async getBOM() {
    return this.manufacturingService.getBillOfMaterials();
  }
}
