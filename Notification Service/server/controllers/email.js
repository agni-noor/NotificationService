
import { getChannel } from '../queue/rabbitmq.js';


//Move to service
const sendToQueue = async (queue, message) => {
  const channel = getChannel();
  await channel.assertQueue('email_queue', {
    durable: true,
    deadLetterExchange:'dlx_exchange',
    deadLetterRoutingKey:'email_queue_dlq'
   
   }); 
  channel.publish("exchange", "email", Buffer.from(JSON.stringify(message)))
  console.log(`Message sent to queue ${queue}:`, message);
};

export const enqueueEmail = async (req, res) => {
  const { subject, body, recipients } = req.body;

  if (!subject || !body || !recipients) {
    return res.status(400).json({ error: 'subject, body and recipients are required.' });
  }

  try {
    // Move to service
    await sendToQueue('email_queue', { subject, body, recipients });
    res.status(200).json({ message: 'Message queued for processing.' });
  } catch (error) {
    console.error('Failed to enqueue message:', error.message);
    res.status(500).json({ error: 'Failed to enqueue message.' });
  }
};

