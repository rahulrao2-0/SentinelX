import express from 'express';
import { sendLogToKafka } from '../kafka/producer.js';

const router = express.Router();

// POST /api/logs/ingest
router.post('/ingest', async (req, res) => {
  const { logs } = req.body;
  
  if (Array.isArray(logs)) {
    for (const log of logs) {
      const processedLog = {
        ...log,
        receivedAt: new Date().toISOString()
      };
      await sendLogToKafka(processedLog);
    }
  }

  // Respond immediately
  res.status(200).json({ success: true, message: 'Logs buffered to Kafka' });
});

export default router;
