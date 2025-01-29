
import { getChannel } from '../queue/rabbitmq.js';

const sendToQueue = async (queue, message) => {
  const channel = getChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.publish("exchange", "email", Buffer.from(JSON.stringify(message)))
  console.log(`Message sent to queue ${queue}:`, message);
};

export const enqueueEmail = async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject and body are required.' });
  }

  try {
    // Move to service
    await sendToQueue('email_queue', { to, subject, body });
    res.status(200).json({ message: 'Message queued for processing.' });
  } catch (error) {
    console.error('Failed to enqueue message:', error.message);
    res.status(500).json({ error: 'Failed to enqueue message.' });
  }
};

