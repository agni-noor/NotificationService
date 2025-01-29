import amqp from 'amqplib';
import axios from 'axios';
import { emailProviders } from "../const.js";

const rabbitMQUrl = 'amqp://localhost';
const connection = await amqp.connect(rabbitMQUrl);
const channel = await connection.createChannel();

const processEmail = async (providers, payload) => {
  for (const provider of providers) {
    try {
      console.log(payload);
      const response = await axios.post(provider, payload);
      console.log(`Email sent successfully via: ${provider}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to send Email via ${provider}:`, error.message);
    }
  }
  throw new Error('All Email providers failed.');
};

export const processQueueEmails = async (message) => {
  try {
    // throw new Error("Do retry")
    await processEmail(emailProviders, message);
    console.log('Message processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', message);
    // channel.sendToQueue('sms_retry_queue', Buffer.from(message.content), {
    //   persistent: true,
    // });
  }
};


const setupQueues = async () => {
   

    await channel.consume('email_queue', async (message) => {
      if (message) {
        const msgContent = JSON.parse(message.content.toString());
        console.log('Received message:', msgContent);

        try {
          console.log(`Processing Email for to: ${msgContent.to}, subject: ${msgContent.subject}, body: ${msgContent.body}`);
          await processQueueEmails(msgContent);
          channel.ack(message); 
        } catch (error) {
          console.error('Failed to send SMS, moving to retry queue:', error.message);

          

          channel.ack(message); 
        }
      }
    });

    console.log('Workers started, consuming emails.');
};

setupQueues().catch((err) => console.error(err));