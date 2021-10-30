import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Humidity } from 'src/data/humidity.schema';
import { ListHumidityInput } from 'src/graphql/inputs/humidity.inputs';
import { HumidityService } from 'src/services/humidity.service';

@Controller('humidity')
export class HumidityController {
  constructor(private readonly service: HumidityService) {}

  @Get()
  async get(@Query() query) {
    const filter: ListHumidityInput = { sensorId: query.sensorId };
    if (!filter.sensorId) {
      return await this.service.getAllSensorData();
    }
    return this.service.getSensorData(filter);
  }

  @Post()
  post(@Body() data: Humidity) {
    this.service.setSensorData(data);
  }

  @Get('latest')
  async findOne(@Query() query) {
    return this.service.getSensorDataByDate(query.sensorId);
  }
}
