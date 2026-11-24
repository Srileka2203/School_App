import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmAssetsService } from './assets.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Company Assets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/assets')
export class HrmAssetsController {
  constructor(private readonly service: HrmAssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List company IT assets and inventory allocations' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register new company hardware asset' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign asset to an employee' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiBody({ schema: { type: 'object', properties: { employeeId: { type: 'string', example: 'emp-101' }, employeeName: { type: 'string', example: 'Sarah Connor' } } } })
  async assign(@Param('id') id: string, @Body() body: any) {
    return this.service.assign(id, body.employeeId, body.employeeName);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return company asset to inventory stock' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  async returnAsset(@Param('id') id: string) {
    return this.service.returnAsset(id);
  }
}
