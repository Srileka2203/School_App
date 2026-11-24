import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmploymentTypesService } from './employment-types.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employment Types')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employment-types')
export class HrmEmploymentTypesController {
  constructor(private readonly service: HrmEmploymentTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all employmenttypes' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employmenttypes' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmploymentType by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmploymentType details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmploymentType' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "et-01",
  "code": "FULL_TIME",
  "name": "Regular Full-Time",
  "standardHoursPerWeek": 40,
  "benefitsEligible": true,
  "status": "ACTIVE"
} } })
  @ApiResponse({ status: 201, description: 'EmploymentType created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmploymentType' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmploymentType updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmploymentType' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmploymentType deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
