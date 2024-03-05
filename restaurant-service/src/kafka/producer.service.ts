import { Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { Kafka, Partitioners, Producer, ProducerRecord } from "kafkajs";

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
    private readonly kafka = new Kafka({
        brokers: ['localhost:9092']
    });

    private readonly producer: Producer = this.kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
    
    async onModuleInit() {
        await this.producer.connect();
    }

    async produce(record: ProducerRecord) {
        this.producer.send(record);
    }

    async onApplicationShutdown() {
        await this.producer.disconnect();
    }
}