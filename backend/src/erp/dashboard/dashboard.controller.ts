import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ErpDashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/dashboard')
export class ErpDashboardController {
  constructor(private readonly dashboardService: ErpDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get complete ERP dashboard overview metrics' })
  @ApiResponse({ status: 200, description: 'ERP overview metrics' })
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get core ERP operational statistics' })
  @ApiResponse({ status: 200, description: 'Core ERP statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }
}
