import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeeDocumentsService } from './employee-documents.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee Documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employee-documents')
export class HrmEmployeeDocumentsController {
  constructor(private readonly service: HrmEmployeeDocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all employeedocuments' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employeedocuments' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmployeeDocument by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeDocument details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmployeeDocument' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "doc-01",
  "employeeId": "emp-101",
  "title": "Employment Agreement 2023",
  "documentType": "CONTRACT",
  "fileUrl": "https://files.example.com/contracts/emp-101.pdf",
  "expiryDate": null,
  "status": "VERIFIED"
} } })
  @ApiResponse({ status: 201, description: 'EmployeeDocument created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmployeeDocument' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeDocument updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmployeeDocument' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeDocument deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
