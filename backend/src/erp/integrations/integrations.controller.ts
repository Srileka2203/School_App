import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
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

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually trigger data sync for a connector' })
  @ApiParam({ name: 'id', description: 'Connector ID' })
  async triggerSync(@Param('id') id: string) {
    return this.integrationsService.triggerSync(id);
  }

  @Get('logs')
  @ApiOperation({ summary: 'List integration synchronization transaction logs' })
  @ApiQuery({ name: 'connectorId', required: false })
  async getLogs(@Query('connectorId') connectorId?: string) {
    return this.integrationsService.getLogs(connectorId);
  }
}
