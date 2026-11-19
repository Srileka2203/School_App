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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
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

  @Post(':id/execute')
  @ApiOperation({ summary: 'Trigger workflow execution' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiBody({ required: false, schema: { type: 'object', properties: { triggeredBy: { type: 'string', example: 'Admin User' } } } })
  @ApiResponse({ status: 200, description: 'Workflow execution triggered' })
  async execute(@Param('id') id: string, @Body('triggeredBy') triggeredBy?: string) {
    return this.workflowsService.execute(id, triggeredBy);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'List execution history logs for a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'List of workflow executions' })
  async getExecutions(@Param('id') id: string) {
    return this.workflowsService.getExecutions(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an active business workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  async pause(@Param('id') id: string) {
    return this.workflowsService.pause(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused business workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  async resume(@Param('id') id: string) {
    return this.workflowsService.resume(id);
  }
}
