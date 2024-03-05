import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class MenuItem {
  @Prop()
  name: string;
  @Prop()
  price: number;
}
const MenuSchema = SchemaFactory.createForClass(MenuItem);

@Schema()
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  restaurantCapacity : number;

  @Prop()
  cuisine_type: string;

  @Prop({ type: [MenuSchema] })
  menu_items: MenuItem[];

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number], 
  })
  location: [number]; 

  @Prop()
  average_rating: number;
 
}
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);