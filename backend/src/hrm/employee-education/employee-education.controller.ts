import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeeEducationService } from './employee-education.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee Education')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employee-education')
export class HrmEmployeeEducationController {
  constructor(private readonly service: HrmEmployeeEducationService) {}

  @Get()
  @ApiOperation({ summary: 'List all employeeeducation' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employeeeducation' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmployeeEducation by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeEducation details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmployeeEducation' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "edu-01",
  "employeeId": "emp-101",
  "institution": "University of Texas at Austin",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "graduationYear": 2018,
  "grade": "3.85 GPA"
} } })
  @ApiResponse({ status: 201, description: 'EmployeeEducation created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmployeeEducation' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeEducation updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmployeeEducation' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeEducation deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
