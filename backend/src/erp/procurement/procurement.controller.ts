import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Procurement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List all procurement purchase orders' })
  @ApiResponse({ status: 200, description: 'List of purchase orders' })
  async findAll() {
    return this.procurementService.findAll();
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

  @Get('vendors')
  @ApiOperation({ summary: 'List approved suppliers and vendors' })
  async getVendors() {
    return this.procurementService.getVendors();
  }
}
