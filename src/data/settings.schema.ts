import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type SettingsDocument = Settings & Document;

@ObjectType()
@Schema()
export class Settings {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  @Prop()
  sensorId: string;

  @Field(() => Number)
  @Prop()
  sendInterval: number;

  @Field(() => Number)
  @Prop()
  readInterval: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
