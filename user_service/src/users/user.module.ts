import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './entity/user.model';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '../middleware/jwt.service';
import { UserSessionSchema } from './entity/session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema },
      { name : 'Sessions' , schema : UserSessionSchema}
    ]),
    JwtModule.register({
      secret: 'mysercetkey',
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  controllers: [UsersController],
  providers: [UserService , JwtService]
})
export class UserModule{}