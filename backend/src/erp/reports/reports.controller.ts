import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ErpReportsService } from './reports.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/reports')
export class ErpReportsController {
  constructor(private readonly reportsService: ErpReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Get enterprise financial summary report' })
  @ApiResponse({ status: 200, description: 'Financial report' })
  async getFinancialReport() {
    return this.reportsService.getFinancialReport();
  }

  @Get('procurement')
  @ApiOperation({ summary: 'Get procurement and vendor spend analytics' })
  @ApiResponse({ status: 200, description: 'Procurement report' })
  async getProcurementReport() {
    return this.reportsService.getProcurementReport();
  }

  @Get('production')
  @ApiOperation({ summary: 'Get manufacturing and OEE efficiency metrics' })
  @ApiResponse({ status: 200, description: 'Production efficiency report' })
  async getProductionEfficiencyReport() {
    return this.reportsService.getProductionEfficiencyReport();
  }
}
