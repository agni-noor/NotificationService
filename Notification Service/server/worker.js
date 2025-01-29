import amqp from 'amqplib';
import { processQueueMessage } from './controllers/sms.js';

const rabbitMQUrl = 'amqp://localhost';

const setupQueues = async () => {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    await channel.consume('sms_queue', async (message) => {
      if (message) {
        const msgContent = JSON.parse(message.content.toString());
        console.log('Received message:', msgContent);

        try {
          console.log(`Processing SMS for phone: ${msgContent.phone}, text: ${msgContent.text}`);
          await processQueueMessage(msgContent);
          channel.ack(message); 
        } catch (error) {
          console.error('Failed to send SMS, moving to retry queue:', error.message);

          

          channel.ack(message); 
        }
      }
    });

    console.log('Workers started, consuming messages.');
  } catch (error) {
    console.error('Error setting up queues or workers:', error);
    process.exit(1);
  }
};

setupQueues().catch((err) => console.error(err));