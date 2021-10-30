import { Inject, Injectable } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Temperature, TemperatureDocument } from '../data/temperature.schema';
import { Model, Schema as MongooseSchema } from 'mongoose';
import {
	CreateTemperatureInput,
	ListTemperatureInput,
	UpdateTemperatureInput,
} from 'src/graphql/inputs/temperature.inputs';
import { EventService } from "./event.service";

@Injectable()
export class TemperatureService {
	constructor(
		@Inject('MQTT_CLIENT') private client: ClientMqtt,
		@InjectModel(Temperature.name)
		private temperatureModel: Model<TemperatureDocument>,
		private readonly eventService: EventService
	) { }

	async getAllSensorData(): Promise<Temperature[]> {
		return this.temperatureModel.find().exec();
	}
	async getSensorData(filter: ListTemperatureInput): Promise<Temperature[]> {
		return this.temperatureModel.find({ ...filter }).exec();
	}
	async getSensorDataByDate(sensorId: string): Promise<Temperature> {
		return this.temperatureModel
			.findOne({ sensorId })
			.sort({ measurementTime: -1 })
			.exec();
	}
	async createSensorData(
		sensorData: CreateTemperatureInput,
	): Promise<Temperature> {
		const model = new this.temperatureModel(sensorData);
		const temp = await model.save();
		this.eventService.emit({
			eventType: "object",
			eventName: "created",
			data: {
				objectType: "temperature",
				object: temp
			}
		});
		return temp;
	}
	async getSensorDataById(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Temperature> {
		return this.temperatureModel.findOne({ _id }).exec();
	}
	async updateSensorData(
		sensorData: UpdateTemperatureInput,
	): Promise<Temperature> {
		return this.temperatureModel
			.findByIdAndUpdate(sensorData._id, sensorData, { new: true, useFindAndModify: false })
			.exec();
	}
	async deleteSensorData(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Temperature> {
		return this.temperatureModel.findByIdAndDelete(_id, { useFindAndModify: false }).exec();
	}
	setSensorData(sensorData: Temperature): void {
		this.client.emit('temperature/changed', JSON.stringify(sensorData));
	}
}
