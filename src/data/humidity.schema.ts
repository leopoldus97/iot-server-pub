import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HumidityDocument = Humidity & Document;

@ObjectType()
@Schema()
export class Humidity {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  @Prop()
  sensorId: string;

  @Field(() => Number)
  @Prop()
  value: number;

  @Field(() => Date)
  @Prop()
  measurementTime: Date;
}

export const HumiditySchema = SchemaFactory.createForClass(Humidity);
