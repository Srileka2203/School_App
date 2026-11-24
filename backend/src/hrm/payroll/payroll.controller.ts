import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmPayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Payroll & Compensation')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/payroll')
export class HrmPayrollController {
  constructor(private readonly service: HrmPayrollService) {}

  @Get('runs')
  @ApiOperation({ summary: 'List payroll batch execution runs' })
  async getRuns() {
    return this.service.getRuns();
  }

  @Get('slips')
  @ApiOperation({ summary: 'List individual monthly employee payslips' })
  @ApiQuery({ name: 'employeeId', required: false })
  async getSlips(@Query() query: any) {
    return this.service.getSlips(query);
  }

  @Get('slips/:id')
  @ApiOperation({ summary: 'Get single employee payslip details' })
  @ApiParam({ name: 'id', description: 'Payslip ID' })
  async getSlip(@Param('id') id: string) {
    return this.service.getSlip(id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Trigger automated monthly payroll processing calculation' })
  @ApiBody({ schema: { type: 'object', properties: { month: { type: 'string', example: 'December 2026' } } } })
  async processRun(@Body() body: any) {
    return this.service.processRun(body.month || 'December 2026');
  }
}
