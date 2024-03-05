import { Controller, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Controller('kafka')
export class KafkaController implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  onModuleInit() {
    this.startKafkaConsumer();
  }

  private async startKafkaConsumer() {
    await this.kafkaService.fun();
  }
}
