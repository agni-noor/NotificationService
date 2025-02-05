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





const setupQueues = async () => {

  await channel.assertQueue('email_queue', {
     durable: true,
     deadLetterExchange:'dlx_exchange',
     deadLetterRoutingKey:'email_queue_dlq'
    
    });



  await channel.consume('email_queue', async (message) => {
    if (message) {
      const msgContent = JSON.parse(message.content.toString());
      console.log('Received message:', msgContent);

      try {
        console.log(
          `Processing Email for subject: ${msgContent.subject}, body: ${msgContent.body}, recipients: ${msgContent.recipients}`
        );
        await processEmail(msgContent);
        console.log('Email processed successfully:', msgContent);
        channel.ack(message);
      } catch (error) {
        console.error('Failed to send email, moving to retry queue:', error.message);
        channel.nack(message, false, false); 
      }
    }
  });

  console.log('Workers started, consuming emails.');
};

setupQueues()