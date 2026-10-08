import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'sentinelx-backend',
  brokers: ['localhost:9094'] // Assumes Kafka is running locally on port 9094
});
