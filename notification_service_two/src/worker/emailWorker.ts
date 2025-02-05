import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import axios from 'axios';
import { getEmailProviderPriorities } from '../providers/getEmailProviders';

type EmailPayload = {
  subject: string;
  body: string;
  recipients: string[];
};

type Provider = {
  provider_name: string;
  provider_address: string;
  priority: number;
};

const rabbitMQUrl: string = 'amqp://localhost';

let connection: Connection;
let channel: Channel;

const connectRabbitMQ = async (): Promise<void> => {
  connection = await amqp.connect(rabbitMQUrl);
  channel = await connection.createChannel();
};

const sendEmail = async (provider: Provider, payload: EmailPayload): Promise<boolean> => {
  try {
    console.log(`Attempting to send Email via ${provider.provider_name}...`);
    console.log('Payload:', payload);
    console.log('Provider Address:', provider.provider_address);

    await axios.post(provider.provider_address, payload);
    console.log(`Email sent successfully via ${provider.provider_name}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send Email via ${provider.provider_name}:`, error.message);
    return false;
  }
};

const sortProvidersByPriority = (providers: Provider[]): Provider[] => {
  return providers.sort((a, b) => a.priority - b.priority);
};

const processEmail = async (payload: EmailPayload): Promise<void> => {
  const providers = await getEmailProviderPriorities();
  const sortedProviders = sortProvidersByPriority(providers);

  for (const provider of sortedProviders) {
    const success = await sendEmail(provider, payload);
    if (success) return;
  }

  throw new Error('All Email providers failed to send the Email.');
};

const setupQueues = async (): Promise<void> => {
  await channel.assertQueue('email_queue', {
    durable: true,
    deadLetterExchange: 'dlx_exchange',
    deadLetterRoutingKey: 'email_queue_dlq'
  });

  await channel.consume('email_queue', async (message: ConsumeMessage | null) => {
    if (message) {
      const msgContent: EmailPayload = JSON.parse(message.content.toString());
      console.log('Received message:', msgContent);

      try {
        console.log(
          `Processing Email for subject: ${msgContent.subject}, body: ${msgContent.body}, recipients: ${msgContent.recipients}`
        );
        await processEmail(msgContent);
        console.log('Email processed successfully:', msgContent);
        channel.ack(message);
      } catch (error: any) {
        console.error('Failed to send email, moving to retry queue:', error.message);
        channel.nack(message, false, false);
      }
    }
  });

  console.log('Workers started, consuming emails.');
};

const startWorker = async (): Promise<void> => {
  await connectRabbitMQ();
  await setupQueues();
};

startWorker().catch(console.error);
