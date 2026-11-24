import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Shifts & Rosters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/shifts')
export class HrmShiftsController {
  constructor(private readonly service: HrmShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'List all work shift configurations' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift details' })
  @ApiParam({ name: 'id', description: 'Shift ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new shift timing' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Weekend Support Shift' }, startTime: { type: 'string', example: '10:00' }, endTime: { type: 'string', example: '19:00' }, breakMinutes: { type: 'number', example: 60 } } } })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign staff members to shift roster' })
  async assign(@Body() body: any) {
    return this.service.assign(body);
  }
}
