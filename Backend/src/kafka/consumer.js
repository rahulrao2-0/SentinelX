import { kafka } from './config.js';

const consumer = kafka.consumer({ groupId: 'live-stream-group' });
const admin = kafka.admin();

export const startConsumer = async (io) => {
  // 1. Pre-create the topic using the Admin client to prevent crash
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [{ topic: 'logs-raw' }],
      waitForLeaders: true,
    });
    console.log('✅ Topic "logs-raw" ensured');
  } catch (err) {
    // It's okay if it already exists
  } finally {
    await admin.disconnect();
  }

  // 2. Now start the consumer safely
  await consumer.connect();
  console.log('✅ Kafka Consumer connected');

  // Subscribe to the topic
  await consumer.subscribe({ topic: 'logs-raw', fromBeginning: false });

  // Start processing messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const logString = message.value.toString();
      console.log(`[Kafka Consumer] Received log from Kafka:`, logString);

      console.log(`[Kafka Consumer] Log content: ${message.value.toString()}`);
      
      try {
        const logData = JSON.parse(logString);
        
        // Push the log to the single test room via Socket.io
        io.to('test-room').emit('new_log', logData);
        console.log(`[Socket.io] Emitted log to 'test-room'`);
        
      } catch (err) {
        console.error('Failed to parse log message from Kafka', err);
      }
    },
  });
};
