import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'ERP overview metrics' })
  async getOverview(@Query('workspaceId') workspaceId?: string) {
    return this.dashboardService.getOverview(workspaceId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get core ERP operational statistics' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Core ERP statistics' })
  async getStats(@Query('workspaceId') workspaceId?: string) {
    return this.dashboardService.getStats(workspaceId);
  }

  @Get('activity-feed')
  @ApiOperation({ summary: 'Get real-time consolidated ERP activity stream' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'ERP activity feed' })
  async getActivityFeed(@Query('workspaceId') workspaceId?: string) {
    return this.dashboardService.getActivityFeed(workspaceId);
  }
}
