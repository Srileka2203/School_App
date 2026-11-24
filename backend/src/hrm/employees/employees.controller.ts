import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employees')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employees')
export class HrmEmployeesController {
  constructor(private readonly service: HrmEmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List all employees' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employees' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Employee by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Employee' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "emp-101",
  "employeeNumber": "EMP-1001",
  "firstName": "Sarah",
  "lastName": "Connor",
  "email": "sarah.connor@example.com",
  "phone": "+1-555-0101",
  "department": "Engineering",
  "designation": "Staff Software Engineer",
  "location": "Austin HQ",
  "jobGrade": "L5",
  "employmentType": "Full-time",
  "status": "ACTIVE",
  "joiningDate": "2023-03-15",
  "salary": 145000
} } })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing Employee' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Employee' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
