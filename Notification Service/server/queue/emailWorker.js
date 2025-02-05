import amqp from 'amqplib';
import axios from 'axios';
import { getEmailProviderPriorities } from '../providers/getEmailProviders.js';


const rabbitMQUrl = 'amqp://localhost';
const connection = await amqp.connect(rabbitMQUrl);
const channel = await connection.createChannel();


const sendEmail = async (provider, payload) => {
  try {
    console.log(`Attempting to send Email via ${provider.provider_name}...`);
    console.log('Payload:', payload);
    console.log('Provider Address:', provider.provider_address);

    await axios.post(provider.provider_address, payload);
    console.log(`Email sent successfully via ${provider.provider_name}`);
    return true; 
  } catch (error) {
    console.error(`Failed to send Email via ${provider.provider_name}:`, error.message);
    return false; 
  }
};

const sortProvidersByPriority = (providers) => {
  return providers.sort((a, b) => a.priority - b.priority);
};


const processEmail = async (payload) => {
  const providers = await getEmailProviderPriorities(); 
  const sortedProviders = sortProvidersByPriority(providers); 

  for (const provider of sortedProviders) {
    const success = await sendEmail(provider, payload);
    if (success) return; 
  }


  throw new Error('All Email providers failed to send the Email.');
};




export const processQueueEmails = async (message) => {
  try {
    await processEmail(message);
    console.log('Email processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', error.message);
  }
};


const setupQueues = async () => {
  await channel.assertQueue('email_queue', { durable: true });

  await channel.consume('email_queue', async (message) => {
    if (message) {
      const msgContent = JSON.parse(message.content.toString());
      console.log('Received message:', msgContent);

      try {
        console.log(
          `Processing Email for subject: ${msgContent.subject}, body: ${msgContent.body}, recipients: ${msgContent.recipients}`
        );
        await processQueueEmails(msgContent);
        channel.ack(message);
      } catch (error) {
        console.error('Failed to send email, moving to retry queue:', error.message);
        channel.ack(message); 
      }
    }
  });

  console.log('Workers started, consuming emails.');
};

// Start the queue setup
setupQueues().catch((err) => console.error(err));