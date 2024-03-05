import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { ReservationController } from './restaurant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema } from './entity/reservation.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'src/proto/user/user';
import { AuthService } from 'src/middleware/auth.service';
import { RestaurantSchema } from './entity/restaurant.entity';
import { OrderSchema } from './entity/order.entity';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'Restaurant', schema: RestaurantSchema },
      {name : 'Order' , schema : OrderSchema}
    ]),
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50051',
          package: USER_PACKAGE_NAME,
          protoPath: '/home/admin185/Desktop/grpc_micro/restaurant-service/src/proto/user/user.proto',
        },
      },
    ])

  ],
  controllers: [ReservationController],
  providers: [RestaurantService, AuthService],

})
export class ReservationModule { }
