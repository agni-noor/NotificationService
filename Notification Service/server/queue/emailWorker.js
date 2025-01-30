import amqp from 'amqplib';
import { sendEmailToProvider1, sendEmailToProvider2, sendEmailToProvider3 } from '../const.js';

const rabbitMQUrl = 'amqp://localhost';
const connection = await amqp.connect(rabbitMQUrl);
const channel = await connection.createChannel();

const processEmail = async (providers, payload) => {

  await sendEmailToProvider1(payload)

};

export const processQueueEmails = async (message) => {
  try {
    await processEmail(emailProviders, message);
    console.log('Message processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', message);
  }
};


const setupQueues = async () => {
   

    await channel.consume('email_queue', async (message) => {
      if (message) {
        const msgContent = JSON.parse(message.content.toString());
        console.log('Received message:', msgContent);

        try {
          console.log(`Processing Email for subject: ${msgContent.subject}, body: ${msgContent.body}, recipients: ${msgContent.recipients}`);
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