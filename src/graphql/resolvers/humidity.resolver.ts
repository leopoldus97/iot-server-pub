import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Humidity } from 'src/data/humidity.schema';
import { HumidityService } from 'src/services/humidity.service';
import { Schema as MongooseSchema } from 'mongoose';
import { PubSub } from 'graphql-subscriptions';
import {
	CreateHumidityInput,
	ListHumidityInput,
	UpdateHumidityInput,
} from '../inputs/humidity.inputs';
import { EventService } from "src/services/event.service";
import { filter, tap } from "rxjs";

@Resolver(() => Humidity)
export class HumidityResolver {
	private pubsub = new PubSub();

	constructor(private humidityService: HumidityService, private readonly eventService: EventService) {
		this.eventService.events$.pipe(
			filter(ev => ev.eventType === "object" && ev.data.objectType === "humidity" && ev.eventName === "created"),
			tap(ev => this.pubsub.publish("humidityAdded", {humidityAdded: ev.data.object}))
		).subscribe();
	}

	@Query(() => Humidity)
	async humidity(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		return await this.humidityService.getSensorDataById(_id);
	}

	@Query(() => [Humidity])
	async humidities(
		@Args('filter', { nullable: true }) filter?: ListHumidityInput,
	) {
		return await this.humidityService.getSensorData(filter);
	}

	@Mutation(() => Humidity)
	async createHumidityEntry(@Args('payload') payload: CreateHumidityInput) {
		const humidity = await this.humidityService.createSensorData(payload);
		this.pubsub.publish('humidityAdded', { humidityAdded: humidity });
		return humidity;
	}

	@Mutation(() => Humidity)
	async updateHumidityEntry(@Args('payload') payload: UpdateHumidityInput) {
		const humidity = await this.humidityService.updateSensorData(payload);
		this.pubsub.publish('humidityUpdated', { humidityUpdated: humidity });
		return humidity;
	}

	@Mutation(() => Humidity)
	async deleteHumidityEntry(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		const humidity = await this.humidityService.deleteSensorData(_id);
		this.pubsub.publish('humidityDeleted', { humidityDeleted: humidity });
		return humidity;
	}

	@Subscription(() => Humidity)
	humidityAdded() {
		return this.pubsub.asyncIterator('humidityAdded');
	}

	@Subscription(() => Humidity)
	humidityUpdated() {
		return this.pubsub.asyncIterator('humidityUpdated');
	}

	@Subscription(() => Humidity)
	humidityDeleted() {
		return this.pubsub.asyncIterator('humidityDeleted');
	}
}
