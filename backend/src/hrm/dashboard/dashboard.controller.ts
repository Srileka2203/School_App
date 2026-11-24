import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HrmDashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/dashboard')
export class HrmDashboardController {
  constructor(private readonly service: HrmDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get HRM executive dashboard overview metrics' })
  @ApiResponse({ status: 200, description: 'HRM executive dashboard overview' })
  async getOverview() {
    return this.service.getOverview();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get HRM operational efficiency statistics' })
  @ApiResponse({ status: 200, description: 'HRM operational statistics' })
  async getStats() {
    return this.service.getStats();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get live HRM personnel activity stream' })
  @ApiResponse({ status: 200, description: 'Recent personnel activity logs' })
  async getRecentActivity() {
    return this.service.getRecentActivity();
  }
}
