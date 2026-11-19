import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Financial report' })
  async getFinancialReport(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getFinancialReport(workspaceId);
  }

  @Get('procurement')
  @ApiOperation({ summary: 'Get procurement and vendor spend analytics' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Procurement report' })
  async getProcurementReport(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getProcurementReport(workspaceId);
  }

  @Get('production')
  @ApiOperation({ summary: 'Get manufacturing and OEE efficiency metrics' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Production efficiency report' })
  async getProductionEfficiencyReport(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getProductionEfficiencyReport(workspaceId);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory valuation and stock health report' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Inventory valuation report' })
  async getInventoryReport(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getInventoryReport(workspaceId);
  }

  @Get('quality')
  @ApiOperation({ summary: 'Get QA pass rates and defect analysis report' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Quality report' })
  async getQualityReport(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getQualityReport(workspaceId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get executive consolidated ERP summary report' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Executive summary report' })
  async getExecutiveSummary(@Query('workspaceId') workspaceId?: string) {
    return this.reportsService.getExecutiveSummary(workspaceId);
  }
}
