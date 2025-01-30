
import { getChannel } from '../queue/rabbitmq.js';

export const sendToQueue = async (queue, message) => {
  const channel = getChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.publish("exchange", "email", Buffer.from(JSON.stringify(message)))
  console.log(`Message sent to queue ${queue}:`, message);
};
