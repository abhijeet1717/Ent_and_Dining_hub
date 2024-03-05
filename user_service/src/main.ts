import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from './proto/user/user';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC, 
    options: {
      url: '0.0.0.0:50051',
      protoPath: join(__dirname, '../src/proto/user/user.proto'),
      package: protobufPackage
  }});
  await app.startAllMicroservices();
  await app.listen(process.env.PORT);
}
bootstrap();
