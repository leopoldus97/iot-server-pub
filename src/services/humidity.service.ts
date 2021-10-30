import { Inject, Injectable } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Humidity, HumidityDocument } from 'src/data/humidity.schema';
import {
	CreateHumidityInput,
	ListHumidityInput,
	UpdateHumidityInput,
} from 'src/graphql/inputs/humidity.inputs';
import { EventService } from "./event.service";

@Injectable()
export class HumidityService {
	constructor(
		@Inject('MQTT_CLIENT') private client: ClientMqtt,
		@InjectModel(Humidity.name) private humidityModel: Model<HumidityDocument>,
		private readonly eventService: EventService
	) { }

	async getAllSensorData(): Promise<Humidity[]> {
		return this.humidityModel.find().exec();
	}
	async getSensorData(filter: ListHumidityInput): Promise<Humidity[]> {
		return this.humidityModel.find({ ...filter }).exec();
	}
	async getSensorDataByDate(sensorId: string): Promise<Humidity> {
		return this.humidityModel
			.findOne({ sensorId })
			.sort({ measurementTime: -1 })
			.exec();
	}
	async getSensorDataById(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Humidity> {
		return this.humidityModel.findOne({ _id }).exec();
	}
	async createSensorData(sensorData: CreateHumidityInput): Promise<Humidity> {
		const model = new this.humidityModel(sensorData);
		const humidity = await model.save();
		this.eventService.emit({
			eventType: "object",
			eventName: "created",
			data: {
				objectType: "humidity",
				object: humidity
			}
		});
		return humidity;
	}
	async updateSensorData(sensorData: UpdateHumidityInput): Promise<Humidity> {
		return this.humidityModel
			.findByIdAndUpdate(sensorData._id, sensorData, { new: true, useFindAndModify: false })
			.exec();
	}
	async deleteSensorData(
		_id: MongooseSchema.Types.ObjectId,
	): Promise<Humidity> {
		return this.humidityModel.findByIdAndDelete(_id, { useFindAndModify: false }).exec();
	}
	setSensorData(sensorData: Humidity): void {
		this.client.emit('humidity/changed', JSON.stringify(sensorData));
	}
}
