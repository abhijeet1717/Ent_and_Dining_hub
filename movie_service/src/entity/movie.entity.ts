import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Movies extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true })
  release_date: Date;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  synopsis: string;

  @Prop({required:true})
  ticket_price : number

  @Prop()
  discountPercentage: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movies);
