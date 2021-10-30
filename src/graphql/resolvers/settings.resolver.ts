import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Settings } from 'src/data/settings.schema';
import { SettingsService } from 'src/services/settings.service';
import { Schema as MongooseSchema } from 'mongoose';
import {
	CreateSettingsInput,
	ListSettingsInput,
	UpdateSettingsInput,
} from '../inputs/settings.inputs';
import { PubSub } from 'graphql-subscriptions';
import { EventService } from "src/services/event.service";
import { filter, tap } from "rxjs";

@Resolver(() => Settings)
export class SettingsResolver {
	private pubsub = new PubSub();

	constructor(private settingsService: SettingsService, private readonly eventService: EventService) {
		this.eventService.events$.pipe(
			filter(ev => ev.eventType === "object" && ev.data.objectType === "config" && ev.eventName === "created"),
			tap(ev => this.pubsub.publish("settingsAdded", { settingsAdded: ev.data.object }))
		).subscribe();
	}

	@Query(() => Settings)
	async setting(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		return await this.settingsService.getSensorDataById(_id);
	}

	@Query(() => [Settings])
	async settings(
		@Args('filter', { nullable: true }) filter?: ListSettingsInput,
	) {
		return await this.settingsService.getSensorData(filter);
	}

	@Mutation(() => Settings)
	async createSettingsEntry(@Args('payload') payload: CreateSettingsInput) {
		const setting = await this.settingsService.createSensorData(payload);
		this.pubsub.publish('settingsAdded', { settingsAdded: setting });
		return setting;
	}

	@Mutation(() => Settings)
	async updateSettingsEntry(@Args('payload') payload: UpdateSettingsInput) {
		const setting = await this.settingsService.updateSensorData(payload);
		this.pubsub.publish('settingsUpdated', { settingsUpdated: setting });
		return setting;
	}

	@Mutation(() => Settings)
	async deleteSettingsEntry(
		@Args('_id', { type: () => String }) _id: MongooseSchema.Types.ObjectId,
	) {
		const setting = await this.settingsService.deleteSensorData(_id);
		this.pubsub.publish('settingsDeleted', { settingsDeleted: setting });
		return setting;
	}

	@Subscription(() => Settings)
	settingsAdded() {
		return this.pubsub.asyncIterator('settingsAdded');
	}

	@Subscription(() => Settings)
	settingsUpdated() {
		return this.pubsub.asyncIterator('settingsUpdated');
	}

	@Subscription(() => Settings)
	settingsDeleted() {
		return this.pubsub.asyncIterator('settingsDeleted');
	}
}
