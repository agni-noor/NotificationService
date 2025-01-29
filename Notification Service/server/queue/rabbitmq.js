
import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    await channel.assertQueue('sms_queue', { durable: true });

    await channel.assertQueue('email_queue', { durable: true });

    await channel.assertExchange('exchange', 'direct', { durable: true });

    // await channel.assertQueue('sms_retry_queue', {
    //   durable: true,
    //   arguments: {
    //     'x-dead-letter-exchange': '', 
    //     'x-dead-letter-routing-key': 'sms_queue', 
    //     'x-message-ttl': 10000,
    //   },
    // });

    await channel.bindQueue('sms_queue', 'exchange', 'sms');

    await channel.bindQueue('email_queue', 'exchange', 'email');

    console.log('Connected to RabbitMQ and queues initialized');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    process.exit(1);
  }
};

export const getChannel = () => channel;