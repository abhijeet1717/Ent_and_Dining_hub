import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { ConsumerService } from './consumer.service';

@Module({
  controllers: [KafkaController],
  providers: [KafkaService,ConsumerService],
})
export class KafkaModule {}