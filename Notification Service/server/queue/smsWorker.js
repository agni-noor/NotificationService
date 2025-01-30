import amqp from 'amqplib';
import axios from 'axios';
import { sendSMSToProvider1, sendSMSToProvider2, sendSMSToProvider3} from '../const.js';

const rabbitMQUrl = 'amqp://localhost';
const connection = await amqp.connect(rabbitMQUrl);
const channel = await connection.createChannel();

const processSMS = async (providers, payload) => {

  await sendSMSToProvider1(payload)
};

export const processQueueMessage = async (message) => {
  try {
    await processSMS(smsProviders, message);
    console.log('Message processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', message);
  }
};


const setupQueues = async () => {
   

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
};

setupQueues().catch((err) => console.error(err));