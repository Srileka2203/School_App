import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmOnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Onboarding')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/onboarding')
export class HrmOnboardingController {
  constructor(private readonly service: HrmOnboardingService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'List onboarding orientation and setup tasks' })
  @ApiQuery({ name: 'employeeId', required: false })
  async getTasks(@Query('employeeId') employeeId?: string) {
    return this.service.getTasks(employeeId);
  }

  @Get('progress/:employeeId')
  @ApiOperation({ summary: 'Calculate completion percentage for new hire onboarding' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async getProgress(@Param('employeeId') employeeId: string) {
    return this.service.getProgress(employeeId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Assign a new onboarding checklist task' })
  async createTask(@Body() body: any) {
    return this.service.createTask(body);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Update onboarding task status' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', example: 'COMPLETED' } } } })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateTaskStatus(id, status);
  }
}
