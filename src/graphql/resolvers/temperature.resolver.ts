import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Temperature } from 'src/data/temperature.schema';
import { TemperatureService } from 'src/services/temperature.service';
import { Schema as MongooseSchema } from 'mongoose';
import { PubSub } from 'graphql-subscriptions';
import {
	CreateTemperatureInput,
	ListTemperatureInput,
	UpdateTemperatureInput,
} from '../inputs/temperature.inputs';
import { EventService } from "src/services/event.service";
import { filter, tap } from "rxjs";

@Resolver(() => Temperature)
export class TemperatureResolver {
	private pubsub = new PubSub();

	constructor(private temperatureService: TemperatureService, private readonly eventService: EventService) {
		this.eventService.events$.pipe(
			filter(ev => ev.eventType === "object" && ev.data.objectType === "temperature" && ev.eventName === "created"),
			tap(ev => this.pubsub.publish("temperatureAdded", { temperatureAdded: ev.data.object }))
		).subscribe();
	}

	@Query(() => Temperature)
	async temperature(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		return await this.temperatureService.getSensorDataById(_id);
	}

	@Query(() => [Temperature])
	async temperatures(
		@Args('filter', { nullable: true }) filter?: ListTemperatureInput,
	) {
		return await this.temperatureService.getSensorData(filter);
	}

	@Mutation(() => Temperature)
	async createTemperatureEntry(
		@Args('payload') payload: CreateTemperatureInput,
	) {
		const temperature = await this.temperatureService.createSensorData(payload);
		this.pubsub.publish('temperatureAdded', { temperatureAdded: temperature });
		return temperature;
	}

	@Mutation(() => Temperature)
	async updateTemperatureEntry(
		@Args('payload') payload: UpdateTemperatureInput,
	) {
		const temperature = await this.temperatureService.updateSensorData(payload);
		this.pubsub.publish('temperatureUpdated', {
			temperatureUpdated: temperature,
		});
		return temperature;
	}

	@Mutation(() => Temperature)
	async deleteTemperatureEntry(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		const temperature = await this.temperatureService.deleteSensorData(_id);
		this.pubsub.publish('temperatureDeleted', {
			temperatureDeleted: temperature,
		});
		return temperature;
	}

	@Subscription(() => Temperature)
	temperatureAdded() {
		return this.pubsub.asyncIterator('temperatureAdded');
	}

	@Subscription(() => Temperature)
	temperatureUpdated() {
		return this.pubsub.asyncIterator('temperatureUpdated');
	}

	@Subscription(() => Temperature)
	temperatureDeleted() {
		return this.pubsub.asyncIterator('temperatureDeleted');
	}
}
