import { Field, InputType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';

@InputType()
export class CreateSettingsInput {
  @Field(() => String)
  sensorId: string;

  @Field(() => Number)
  sendInterval: number;

  @Field(() => Number)
  readInterval: number;
}

@InputType()
export class ListSettingsInput {
  @Field(() => String, { nullable: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Field(() => String, { nullable: true })
  sensorId?: string;

  @Field(() => Number, { nullable: true })
  sendInterval?: number;

  @Field(() => Number, { nullable: true })
  readInterval?: number;
}

@InputType()
export class UpdateSettingsInput {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String, { nullable: true })
  sensorId?: string;

  @Field(() => Number, { nullable: true })
  sendInterval?: number;

  @Field(() => Number, { nullable: true })
  readInterval?: number;
}
