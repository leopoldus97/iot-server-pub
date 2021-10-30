import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload
} from '@nestjs/microservices';
import { Humidity } from 'src/data/humidity.schema';
import { HumidityService } from 'src/services/humidity.service';

@Controller()
export class HumidityMqttController {

  constructor(private readonly service: HumidityService) {}

  @MessagePattern('humidity/changed')
  async humidityChanged(@Payload() data: any, @Ctx() context: MqttContext) {
    const sensorData: Humidity = JSON.parse(data);
    return await this.service.createSensorData(sensorData);
  }
}
