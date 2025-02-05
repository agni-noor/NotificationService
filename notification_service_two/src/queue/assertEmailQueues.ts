import { Channel } from 'amqplib';

export const assertEmailQueue = async(channel:Channel):Promise<void> =>{
    await channel.assertQueue('email_queue', {
        durable: true,
        deadLetterExchange: 'dlx_exchange',
        deadLetterRoutingKey: 'email_queue_dlq'
      });
      

}

export const assertEmailDLQ = async(channel:Channel):Promise<void> =>{
  await channel.assertQueue('email_queue_dlq', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': 'exchange',
      'x-dead-letter-routing-key': 'email'
    }
  });
}