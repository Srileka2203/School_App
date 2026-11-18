import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
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

  @Get('vendors')
  @ApiOperation({ summary: 'List approved suppliers and vendors' })
  @ApiQuery({ name: 'workspaceId', required: false })
  async getVendors(@Query('workspaceId') workspaceId?: string) {
    return this.procurementService.getVendors(workspaceId);
  }
}
