import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Reservation extends Document {
  @Prop()
  userId: string;

  @Prop()
  restaurantId: string;

  @Prop()
  reservationTime: Date;

  @Prop()
  numberOfGuests : number

  @Prop({ enum: ['Booked', 'Cancelled'], default: 'Booked' })
  status: string;
}


export const ReservationSchema = SchemaFactory.createForClass(Reservation);
