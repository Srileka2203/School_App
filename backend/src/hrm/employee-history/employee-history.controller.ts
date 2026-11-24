import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeeHistoryService } from './employee-history.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee History')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employee-history')
export class HrmEmployeeHistoryController {
  constructor(private readonly service: HrmEmployeeHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all employeehistory' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employeehistory' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmployeeHistory by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeHistory details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmployeeHistory' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "eh-01",
  "employeeId": "emp-101",
  "eventType": "PROMOTION",
  "description": "Promoted from Senior to Staff Engineer",
  "previousValue": "Senior Software Engineer",
  "newValue": "Staff Software Engineer",
  "effectiveDate": "2024-04-01"
} } })
  @ApiResponse({ status: 201, description: 'EmployeeHistory created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmployeeHistory' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeHistory updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmployeeHistory' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeHistory deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
