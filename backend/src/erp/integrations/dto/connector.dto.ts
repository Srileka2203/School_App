import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConnectorDto {
  @ApiProperty({
    description: 'Name of the ERP connector',
    example: 'QuickBooks Enterprise Gateway',
  })
  name: string;

  @ApiProperty({
    description: 'Connector integration type',
    enum: ['ACCOUNTING', 'EDI', 'LOGISTICS', 'BANKING', 'CUSTOM_WEBHOOK'],
    example: 'ACCOUNTING',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Initial connection status',
    enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'],
    default: 'CONNECTED',
    example: 'CONNECTED',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Connector configuration parameters',
    example: { endpoint: 'https://api.quickbooks.com/v3', authType: 'OAuth2' },
  })
  config?: any;

  @ApiPropertyOptional({
    description: 'Associated workspace ID',
    example: 'ws-default',
  })
  workspaceId?: string;
}

export class UpdateConnectorDto {
  @ApiPropertyOptional({
    description: 'Name of the ERP connector',
    example: 'QuickBooks Enterprise Gateway v2',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Connector integration type',
    enum: ['ACCOUNTING', 'EDI', 'LOGISTICS', 'BANKING', 'CUSTOM_WEBHOOK'],
    example: 'ACCOUNTING',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Connection status',
    enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'],
    example: 'CONNECTED',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Connector configuration parameters',
    example: { endpoint: 'https://api.quickbooks.com/v3' },
  })
  config?: any;

  @ApiPropertyOptional({
    description: 'Associated workspace ID',
  })
  workspaceId?: string;
}
