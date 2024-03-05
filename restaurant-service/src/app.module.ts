import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './restaurant/restaurant.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://abhijeetsrivastava:abhijeet2128@cluster0.8uv9xly.mongodb.net/sample_restaurants'),
    // MongooseModule.forRoot('mongodb://localhost:27017/sample_restaurants'),
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
