
import { getChannel } from '../queue/rabbitmq.js';

const sendToQueue = async (queue, message) => {
  const channel = getChannel();
  await channel.assertQueue(queue, { durable: true });
  // channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  channel.publish("exchange", "sms", Buffer.from(JSON.stringify(message)))
  console.log(`Message sent to queue ${queue}:`, message);
};

export const enqueueSMS = async (req, res) => {
  const { phone, text } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone and text are required.' });
  }

  try {
    // Move to service
    await sendToQueue('sms_queue', { phone, text });
    res.status(200).json({ message: 'Message queued for processing.' });
  } catch (error) {
    console.error('Failed to enqueue message:', error.message);
    res.status(500).json({ error: 'Failed to enqueue message.' });
  }
};

