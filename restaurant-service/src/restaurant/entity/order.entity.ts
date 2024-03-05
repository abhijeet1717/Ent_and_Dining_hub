import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant' })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: [{ name: String, quantity: Number }] })
  items: { name: string; quantity: number }[];

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ default: 'food_delivery' })
  orderType: string;

  @Prop({ required: true })
  orderTotal: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
