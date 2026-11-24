import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmAttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/attendance')
export class HrmAttendanceController {
  constructor(private readonly service: HrmAttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List employee daily attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance logs' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('summary/daily')
  @ApiOperation({ summary: 'Get aggregated today attendance summary KPI' })
  async getDailySummary() {
    return this.service.getDailySummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single attendance record details' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Record employee work shift clock-in' })
  @ApiBody({ schema: { type: 'object', properties: { employeeId: { type: 'string', example: 'emp-101' }, employeeName: { type: 'string', example: 'Sarah Connor' }, method: { type: 'string', example: 'WEB_PORTAL' } } } })
  async checkIn(@Body() body: any) {
    return this.service.checkIn(body);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Record employee shift clock-out' })
  @ApiParam({ name: 'id', description: 'Attendance record ID' })
  async checkOut(@Param('id') id: string) {
    return this.service.checkOut(id);
  }
}
