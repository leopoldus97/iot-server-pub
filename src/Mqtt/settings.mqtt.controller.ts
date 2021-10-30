import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload
} from '@nestjs/microservices';
import { Settings } from 'src/data/settings.schema';
import { SettingsService } from 'src/services/settings.service';

@Controller()
export class SettingsMqttController {
  
  constructor(private readonly service: SettingsService) {}

  @MessagePattern('settings/changed')
  async settingsChanged(@Payload() data: any, @Ctx() context: MqttContext) {
    const settings: Settings = JSON.parse(data);
    return await this.service.createSensorData(settings);
  }
}
