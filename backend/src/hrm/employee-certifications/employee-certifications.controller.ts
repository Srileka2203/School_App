import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmEmployeeCertificationsService } from './employee-certifications.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee Certifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/employee-certifications')
export class HrmEmployeeCertificationsController {
  constructor(private readonly service: HrmEmployeeCertificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all employeecertifications' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword search filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'List of employeecertifications' })
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EmployeeCertification by ID' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeCertification details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new EmployeeCertification' })
  @ApiBody({ schema: { type: 'object', example: {
  "id": "cert-01",
  "employeeId": "emp-101",
  "certificationName": "AWS Certified Solutions Architect - Professional",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2022-09-15",
  "expiryDate": "2025-09-15",
  "credentialId": "AWS-PSA-99412"
} } })
  @ApiResponse({ status: 201, description: 'EmployeeCertification created successfully' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing EmployeeCertification' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeCertification updated successfully' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a EmployeeCertification' })
  @ApiParam({ name: 'id', description: 'Item unique identifier' })
  @ApiResponse({ status: 200, description: 'EmployeeCertification deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
