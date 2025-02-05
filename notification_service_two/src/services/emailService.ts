import { getChannel } from '../queue/rabbitmq';

export const sendToQueue = async (queue: string, message: object): Promise<void> => {
  const channel = getChannel();
  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange: 'dlx_exchange',
    deadLetterRoutingKey: `${queue}_dlq`
  });

  channel.publish("exchange", "email", Buffer.from(JSON.stringify(message)));
  console.log(`Message sent to queue ${queue}:`, message);
};
