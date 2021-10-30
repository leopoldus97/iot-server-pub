import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload
} from '@nestjs/microservices';
import { Temperature } from 'src/data/temperature.schema';
import { TemperatureService } from 'src/services/temperature.service';

@Controller()
export class TemperatureMqttController {
  
  constructor(private readonly service: TemperatureService) {}

  @MessagePattern('temperature/changed')
  async temperatureChanged(@Payload() data: any, @Ctx() context: MqttContext) {
    const sensorData: Temperature = JSON.parse(data);
    return await this.service.createSensorData(sensorData);
  }
}
