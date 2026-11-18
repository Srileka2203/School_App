import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BusinessWorkflowsService } from './business-workflows.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Business Workflows')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/business-workflows')
export class BusinessWorkflowsController {
  constructor(private readonly workflowsService: BusinessWorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'List all ERP business workflows' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of business workflows' })
  async findAll(@Query('workspaceId') workspaceId?: string) {
    return this.workflowsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details by ID' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  async findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new business workflow' })
  async create(@Body() body: any) {
    return this.workflowsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow configuration' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.workflowsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  async remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
