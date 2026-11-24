import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmReportingService } from './reporting.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Reporting Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/reporting')
export class HrmReportingController {
  constructor(private readonly service: HrmReportingService) {}

  @Get('org-chart')
  @ApiOperation({ summary: 'Get visual corporate organizational chart tree' })
  @ApiResponse({ status: 200, description: 'Organization chart tree' })
  async getOrgChart() {
    return this.service.getOrgChart();
  }

  @Get('hierarchy/:employeeId')
  @ApiOperation({ summary: 'Get management hierarchy chain for an employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getHierarchy(@Param('employeeId') employeeId: string) {
    return this.service.getHierarchy(employeeId);
  }

  @Get('direct-reports/:managerId')
  @ApiOperation({ summary: 'List all direct reports for a manager' })
  @ApiParam({ name: 'managerId', description: 'Manager ID' })
  async getDirectReports(@Param('managerId') managerId: string) {
    return this.service.getDirectReports(managerId);
  }

  @Post('assign-manager')
  @ApiOperation({ summary: 'Assign or update an employee reporting manager' })
  @ApiBody({ schema: { type: 'object', properties: { employeeId: { type: 'string', example: 'emp-101' }, managerId: { type: 'string', example: 'mgr-01' }, managerName: { type: 'string', example: 'Alex Mercer' } } } })
  async assignManager(@Body() body: any) {
    return this.service.assignManager(body);
  }
}
