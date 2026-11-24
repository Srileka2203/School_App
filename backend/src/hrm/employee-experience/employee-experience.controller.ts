import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeeExperienceService } from './employee-experience.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee Experience')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employee-experience')
export class HrmEmployeeExperienceController {
  constructor(private readonly service: HrmEmployeeExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'List all employeeexperience' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employeeexperience' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmployeeExperience by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeExperience details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmployeeExperience' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "exp-01",
  "employeeId": "emp-101",
  "companyName": "CloudScale Technologies",
  "designation": "Senior Backend Developer",
  "startDate": "2019-01-01",
  "endDate": "2023-02-28",
  "description": "Architected distributed event messaging cluster with Kafka and Go."
} } })
  @ApiResponse({ status: 201, description: 'EmployeeExperience created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmployeeExperience' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeExperience updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmployeeExperience' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeExperience deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
