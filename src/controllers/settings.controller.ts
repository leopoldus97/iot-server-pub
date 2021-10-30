import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Settings } from 'src/data/settings.schema';
import { ListSettingsInput } from 'src/graphql/inputs/settings.inputs';
import { SettingsService } from 'src/services/settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async get(@Query() query) {
    const filter: ListSettingsInput = { sensorId: query.sensorId };
    if (!filter.sensorId) {
      return await this.service.getAllSensorData();
    }
    return this.service.getSensorData(filter);
  }

  @Post()
  post(@Body() settings: Settings) {
    this.service.setSensorData(settings);
  }

  @Get(':sensorId')
  async findOne(@Param() params) {
    return await this.service.getSensorDataBySensorId(params.sensorId);
  }
}
