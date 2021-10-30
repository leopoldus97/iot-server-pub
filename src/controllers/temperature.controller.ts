import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { query } from 'express';
import { ListTemperatureInput } from 'src/graphql/inputs/temperature.inputs';
import { TemperatureService } from 'src/services/temperature.service';

@Controller('temperature')
export class TemperatureController {
  constructor(private readonly service: TemperatureService) {}

  @Get()
  async get(@Query() query) {
    const filter: ListTemperatureInput = { sensorId: query.sensorId };
    if (!filter.sensorId) {
      return await this.service.getAllSensorData();
    }
    return await this.service.getSensorData(filter);
  }

  @Post()
  post(@Body() data) {
    this.service.setSensorData(data);
  }

  @Get('latest')
  async findOne(@Query() query) {
    return await this.service.getSensorDataByDate(query.sensorId);
  }
}
