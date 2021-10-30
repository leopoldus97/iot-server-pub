import { Inject, Injectable } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Settings, SettingsDocument } from 'src/data/settings.schema';
import {
	CreateSettingsInput,
	ListSettingsInput,
	UpdateSettingsInput,
} from 'src/graphql/inputs/settings.inputs';
import { EventService } from "./event.service";

@Injectable()
export class SettingsService {
	constructor(
		@Inject('MQTT_CLIENT') private client: ClientMqtt,
		@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
		private readonly eventService: EventService
	) { }

	public async getAllSensorData(): Promise<Settings[]> {
		return this.settingsModel.find().exec();
	}
	
	public async getSensorData(filter: ListSettingsInput): Promise<Settings[]> {
		return this.settingsModel.find({ ...filter }).exec();
	}
	
	public async createSensorData(settings: CreateSettingsInput): Promise<Settings> {
		const model = new this.settingsModel(settings);
		const obj = await model.save();
		this.eventService.emit({
			eventType: "object",
			eventName: "created",
			data: {
				objectType: "config",
				object: obj
			}
		});
		return obj;
	}
	
	public async getSensorDataBySensorId(sensorId: string): Promise<Settings> {
		return this.settingsModel.findOne({ sensorId }).exec();
	}
	
	public async getSensorDataById(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Settings> {
		return this.settingsModel.findOne({ _id }).exec();
	}
	
	public async updateSensorData(sensorData: UpdateSettingsInput): Promise<Settings> {
		return this.settingsModel
			.findByIdAndUpdate(sensorData._id, sensorData, { new: true, useFindAndModify: false })
			.exec();
	}
	
	public async deleteSensorData(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Settings> {
		return this.settingsModel.findByIdAndDelete(_id, { useFindAndModify: false }).exec();
	}
	setSensorData(settings: Settings): void {
		this.client.emit('settings/changed', JSON.stringify(settings));
	}
}
