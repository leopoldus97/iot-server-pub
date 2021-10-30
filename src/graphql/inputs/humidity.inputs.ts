import { Field, InputType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';

@InputType()
export class CreateHumidityInput {
  @Field(() => String)
  sensorId: string;

  @Field(() => Number)
  value: number;

  @Field(() => Date)
  measurementTime: Date;
}

@InputType()
export class ListHumidityInput {
  @Field(() => String, { nullable: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Field(() => String, { nullable: true })
  sensorId?: string;

  @Field(() => Number, { nullable: true })
  value?: number;

  @Field(() => Date, { nullable: true })
  measurementTime?: Date;
}

@InputType()
export class UpdateHumidityInput {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String, { nullable: true })
  sensorId?: string;

  @Field(() => Number, { nullable: true })
  value?: number;

  @Field(() => Date, { nullable: true })
  measurementTime?: Date;
}
