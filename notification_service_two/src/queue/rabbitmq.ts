import amqp, { Channel, Connection } from 'amqplib';
import { assertEmailQueue, assertEmailDLQ } from './assertEmailQueues';
import dotenv from 'dotenv';

dotenv.config();

let channel: Channel;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection: Connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertExchange('exchange', 'direct', { durable: true });
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });
    await channel.assertExchange('emailBackoffExchange', 'headers', { durable: true });
    await assertEmailQueue(channel)
    await assertEmailDLQ(channel)


    await channel.assertQueue('sms_queue', {
      durable: true,
      deadLetterExchange: 'dlx_exchange',
      deadLetterRoutingKey: 'sms_queue_dlq'
    });
    
    await channel.assertQueue('sms_queue_dlq', {
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': 'exchange',
        'x-dead-letter-routing-key': 'sms'
      }
    });

    
    await channel.bindQueue('sms_queue', 'exchange', 'sms');
    await channel.bindQueue('email_queue', 'exchange', 'email');
    await channel.bindQueue('email_queue_dlq', 'dlx_exchange', 'email_queue_dlq');
    await channel.bindQueue('sms_queue_dlq', 'dlx_exchange', 'sms_queue_dlq');

    console.log('Connected to RabbitMQ and queues initialized');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
};

export const getChannel = (): Channel => channel;
