import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Sessions extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }) 
  expiresAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(Sessions);
