import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { HumidityController } from './controllers/humidity.controller';
import { SettingsController } from './controllers/settings.controller';
import { TemperatureController } from './controllers/temperature.controller';
import { Humidity, HumiditySchema } from './data/humidity.schema';
import { Settings, SettingsSchema } from './data/settings.schema';
import { Temperature, TemperatureSchema } from './data/temperature.schema';
import { HumidityMqttController } from './Mqtt/humidity.mqtt.controller';
import { SettingsMqttController } from './Mqtt/settings.mqtt.controller';
import { TemperatureMqttController } from './Mqtt/temperature.mqtt.controller';
import { HumidityService } from './services/humidity.service';
import { SettingsService } from './services/settings.service';
import { TemperatureService } from './services/temperature.service';
import { TemperatureResolver } from './graphql/resolvers/temperature.resolver';
import { SettingsResolver } from './graphql/resolvers/settings.resolver';
import { HumidityResolver } from './graphql/resolvers/humidity.resolver';
import { EventService } from "./services/event.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: process.env.MQTT_URL,
          port: 8883,
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        },
      },
    ]),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      { name: Temperature.name, schema: TemperatureSchema },
      { name: Humidity.name, schema: HumiditySchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
    GraphQLModule.forRoot({
      cors: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': true,
        'graphql-ws': true,
      },
      sortSchema: true,
      // playground: true,
      debug: false,
    }),
  ],
  controllers: [
    HumidityController,
    TemperatureController,
    SettingsController,
    HumidityMqttController,
    TemperatureMqttController,
    SettingsMqttController,
  ],
  providers: [
    EventService,
    HumidityService,
    TemperatureService,
    SettingsService,
    HumidityResolver,
    TemperatureResolver,
    SettingsResolver,
  ],
})
export class AppModule {}
