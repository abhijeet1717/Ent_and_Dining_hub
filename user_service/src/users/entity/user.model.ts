import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Users {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop([String])
  preferences: string[];

  @Prop([String])
  dietary_restrictions: string[];

  @Prop([String])
  viewing_habits: string[];

  @Prop({ type: String, enum: ['customer', 'admin'], default: 'customer' })
  role: string;
  @Prop({ type: String, enum: ['active', 'inactive', 'suspended'], default: 'inactive' })
  subscription_status: string;

  @Prop({ default: true }) 
  isActive: boolean;
}
export const UserSchema = SchemaFactory.createForClass(Users)