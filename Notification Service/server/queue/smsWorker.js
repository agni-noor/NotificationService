import amqp from 'amqplib';
import axios from 'axios';
import { getSMSProviderPriorities } from '../providers/getSMSProvider.js';

const rabbitMQUrl = 'amqp://localhost';
const connection = await amqp.connect(rabbitMQUrl);
const channel = await connection.createChannel();


const sendSMS = async (provider, payload) => {
  try {
    console.log(`Attempting to send SMS via ${provider.provider_name}...`);
    console.log('Payload:', payload);
    console.log('Provider Address:', provider.provider_address);

    await axios.post(provider.provider_address, payload);
    console.log(`SMS sent successfully via ${provider.provider_name}`);
    return true; 
  } catch (error) {
    console.error(`Failed to send SMS via ${provider.provider_name}:`, error.message);
    return false; 
  }
};


const sortProvidersByPriority = (providers) => {
  return providers.sort((a, b) => a.priority - b.priority);
};


const processSMS = async (payload) => {
  const providers = await getSMSProviderPriorities(); 
  const sortedProviders = sortProvidersByPriority(providers); 

  for (const provider of sortedProviders) {
    const success = await sendSMS(provider, payload);
    if (success) return; 
  }


  throw new Error('All SMS providers failed to send the SMS.');
};


export const processQueueMessage = async (message) => {
  try {
    await processSMS(message); 
    console.log('Message processed successfully:', message);
  } catch (error) {
    console.error('Processing failed, sending to retry queue:', error.message);

  }
};


const setupQueues = async () => {
  await channel.assertQueue('sms_queue', { durable: true });

  await channel.consume('sms_queue', async (message) => {
    if (message) {
      const msgContent = JSON.parse(message.content.toString());
      console.log('Received message:', msgContent);

      try {
        console.log(
          `Processing SMS for phone: ${msgContent.phone}, text: ${msgContent.text}`
        );
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

// Start the queue setup
setupQueues().catch((err) => console.error(err));