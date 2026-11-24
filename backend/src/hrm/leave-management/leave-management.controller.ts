import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmLeaveManagementService } from './leave-management.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Leave Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/leave-management')
export class HrmLeaveManagementController {
  constructor(private readonly service: HrmLeaveManagementService) {}

  @Get('requests')
  @ApiOperation({ summary: 'Get all employee leave requests' })
  async getRequests() {
    return this.service.getRequests();
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get quota balances (Annual, Sick, Casual)' })
  @ApiQuery({ name: 'employeeId', required: false })
  async getBalances(@Query('employeeId') employeeId?: string) {
    return this.service.getBalances(employeeId);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Submit a new leave application request' })
  @ApiBody({ schema: { type: 'object', properties: { employeeId: { type: 'string', example: 'emp-101' }, employeeName: { type: 'string', example: 'Sarah Connor' }, leaveType: { type: 'string', example: 'ANNUAL' }, startDate: { type: 'string', example: '2026-12-24' }, endDate: { type: 'string', example: '2026-12-28' }, totalDays: { type: 'number', example: 3 }, reason: { type: 'string', example: 'Holiday family vacation' } } } })
  async submitRequest(@Body() body: any) {
    return this.service.submitRequest(body);
  }

  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Managerially approve a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  async approveRequest(@Param('id') id: string) {
    return this.service.approveRequest(id);
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Managerially reject a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  async rejectRequest(@Param('id') id: string, @Body() body: any) {
    return this.service.rejectRequest(id, body?.reason);
  }
}
