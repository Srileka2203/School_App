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
import { IntegrationsService } from './integrations.service';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Integrations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all ERP connectors and enterprise integrations' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of connectors' })
  async getConnectors(@Query('workspaceId') workspaceId?: string) {
    return this.integrationsService.getConnectors(workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ERP connector' })
  @ApiBody({ type: CreateConnectorDto })
  @ApiResponse({ status: 201, description: 'Connector created successfully' })
  async createConnector(@Body() body: CreateConnectorDto) {
    return this.integrationsService.createConnector(body);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialize default sample enterprise connectors' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 201, description: 'Default connectors initialized' })
  async seedConnectors(@Query('workspaceId') workspaceId?: string) {
    await this.integrationsService.seedDefaultConnectors(workspaceId);
    return { message: 'Default enterprise connectors initialized successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'List integration synchronization transaction logs' })
  @ApiQuery({ name: 'connectorId', required: false })
  @ApiResponse({ status: 200, description: 'Integration transaction logs' })
  async getLogs(@Query('connectorId') connectorId?: string) {
    return this.integrationsService.getLogs(connectorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ERP connector details by ID' })
  @ApiParam({ name: 'id', description: 'Connector ID' })
  @ApiResponse({ status: 200, description: 'Connector details' })
  async getConnector(@Param('id') id: string) {
    return this.integrationsService.getConnector(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ERP connector configuration or status' })
  @ApiParam({ name: 'id', description: 'Connector ID' })
  @ApiBody({ type: UpdateConnectorDto })
  @ApiResponse({ status: 200, description: 'Connector updated successfully' })
  async updateConnector(@Param('id') id: string, @Body() body: UpdateConnectorDto) {
    return this.integrationsService.updateConnector(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ERP connector' })
  @ApiParam({ name: 'id', description: 'Connector ID' })
  @ApiResponse({ status: 200, description: 'Connector deleted successfully' })
  async removeConnector(@Param('id') id: string) {
    return this.integrationsService.removeConnector(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually trigger data sync for a connector' })
  @ApiParam({ name: 'id', description: 'Connector ID' })
  @ApiResponse({ status: 201, description: 'Data sync triggered successfully' })
  async triggerSync(@Param('id') id: string) {
    return this.integrationsService.triggerSync(id);
  }
}
