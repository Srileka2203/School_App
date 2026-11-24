import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmDepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/departments')
export class HrmDepartmentsController {
  constructor(private readonly service: HrmDepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of departments' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Department by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Department details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Department' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "dept-01",
  "code": "ENG",
  "name": "Engineering & Technology",
  "headOfDepartment": "Alex Mercer",
  "employeeCount": 42,
  "annualBudget": 4200000,
  "status": "ACTIVE"
} } })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing Department' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Department' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
