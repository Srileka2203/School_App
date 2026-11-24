import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { HrmTrainingService } from './training.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Training & Development')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/training')
export class HrmTrainingController {
  constructor(private readonly service: HrmTrainingService) {}

  @Get('programs')
  @ApiOperation({ summary: 'List all corporate training programs' })
  async getPrograms() {
    return this.service.getPrograms();
  }

  @Post('programs')
  @ApiOperation({ summary: 'Create new corporate workshop or training program' })
  async createProgram(@Body() body: any) {
    return this.service.createProgram(body);
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll employee in training curriculum' })
  @ApiBody({ schema: { type: 'object', properties: { programId: { type: 'string', example: 'tr-01' }, employeeId: { type: 'string', example: 'emp-101' }, employeeName: { type: 'string', example: 'Sarah Connor' } } } })
  async enroll(@Body() body: any) {
    return this.service.enroll(body);
  }
}
