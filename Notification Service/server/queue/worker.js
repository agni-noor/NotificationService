import amqp from 'amqplib';
import axios from 'axios';
import { smsProviders } from "../const.js";

const processSMS = async (providers, payload) => {
  for (const provider of providers) {
    try {
      console.log(payload);
      const response = await axios.post(provider, payload);
      console.log(`SMS sent successfully via: ${provider}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to send SMS via ${provider}:`, error.message);
    }
  }
  throw new Error('All SMS providers failed.');
};

export const processQueueMessage = async (message) => {
  try {
    // throw new Error("Do retry")
    await processSMS(smsProviders, message);
    console.log('Message processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', message);
    const channel = getChannel();
    channel.sendToQueue('sms_retry_queue', Buffer.from(message.content), {
      persistent: true,
    });
  }
};

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