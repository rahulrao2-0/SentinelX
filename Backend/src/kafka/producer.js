import { kafka } from './config.js';

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

export const sendLogToKafka = async (logData) => {
  try {
    await producer.send({
      topic: 'logs-raw',
      messages: [
        { value: JSON.stringify(logData) },
      ],
    });
  } catch (error) {
    console.error('❌ Error sending log to Kafka:', error);
  }
};
