import amqp from 'amqplib';
import { processQueueMessage } from './controllers/sms.js';

const rabbitMQUrl = 'amqp://localhost';

const setupQueues = async () => {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    channel.consume('sms_queue', async (message) => {
      if (message) {
        const msgContent = JSON.parse(message.content.toString());
        console.log('Received message:', msgContent);

        try {
          console.log(`Processing SMS for phone: ${msgContent.phone}, text: ${msgContent.text}`);
          await processQueueMessage(msgContent);
          channel.ack(message);
        } catch (error) {
          console.error('Failed to send SMS, moving to retry queue:', error.message);

          channel.sendToQueue('sms_retry_queue', Buffer.from(message.content), {
            persistent: true, 
          });


          channel.ack(message);
        }
      }
    });

    channel.consume('sms_retry_queue', async (message) => {
      if (message) {
        const retryMsgContent = JSON.parse(message.content.toString());
        console.log('Retrying message:', retryMsgContent);

        try {
          console.log(`Retrying SMS for phone: ${retryMsgContent.phone}, text: ${retryMsgContent.text}`);
          channel.ack(message);
        } catch (error) {
          console.error('Failed to resend SMS from retry queue:', error.message);
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
