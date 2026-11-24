import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HrmReportsService } from './reports.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Reports & Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/reports')
export class HrmReportsController {
  constructor(private readonly service: HrmReportsService) {}

  @Get('headcount')
  @ApiOperation({ summary: 'Get personnel headcount distribution by department' })
  async getHeadcount() {
    return this.service.getHeadcount();
  }

  @Get('turnover')
  @ApiOperation({ summary: 'Get employee turnover, attrition and retention statistics' })
  async getTurnover() {
    return this.service.getTurnover();
  }

  @Get('attendance-summary')
  @ApiOperation({ summary: 'Get aggregated attendance compliance reports' })
  async getAttendanceSummary() {
    return this.service.getAttendanceSummary();
  }

  @Get('payroll-summary')
  @ApiOperation({ summary: 'Get executive payroll and compensation spend breakdown' })
  async getPayrollSummary() {
    return this.service.getPayrollSummary();
  }

  @Get('diversity')
  @ApiOperation({ summary: 'Get organizational diversity and inclusion metrics' })
  async getDiversity() {
    return this.service.getDiversity();
  }
}
