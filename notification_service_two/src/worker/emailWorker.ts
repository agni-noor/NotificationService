import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { assertEmailQueue } from '../queue/assertEmailQueues';
import { emailProviders } from '../providers/emailProviders';
import { getEmailProviderPriorities } from '../providers/getEmailProviders';

interface EmailPayload {
  subject: string;
  body: string;
  recipients: string[];
}

const rabbitMQUrl: string = 'amqp://localhost';
let connection: Connection;
let channel: Channel;

const connectRabbitMQ = async (): Promise<void> => {
  connection = await amqp.connect(rabbitMQUrl);
  channel = await connection.createChannel();
};

const sendEmail = async (providerKey: string, payload: EmailPayload): Promise<boolean> => {
  const provider = emailProviders.find(p => p.provider_key === providerKey);
  if (!provider) {
    console.error(`No matching provider found for key: ${providerKey}`);
    return false;
  }

  try {
    console.log(`Attempting to send Email via ${provider.provider_key}...`);
    console.log('Payload:', payload);
    console.log('Provider Address:', provider.provider_address);

    await provider.sendEmail(payload);
    console.log(`Email sent successfully via ${provider.provider_key}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send Email via ${provider.provider_key}:`, error.message);
    return false;
  }
};

const processEmail = async (payload: EmailPayload): Promise<void> => {
  const providers = await getEmailProviderPriorities();
  const sortedProviders = providers.sort((a, b) => a.priority - b.priority);

  for (const provider of sortedProviders) {
    const success = await sendEmail(provider.provider_key, payload);
    if (success) return;
  }

  throw new Error('All Email providers failed to send the Email.');
};

const setupQueues = async (): Promise<void> => {
  await assertEmailQueue(channel)

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
        let headers = message.properties.headers || {};
        let retryCount = headers['retry-count'] || 0;
        retryCount += 1;
        headers = {
          "x-match":"all",
          "type":"email",
          "retry-count":`${retryCount}`
        }

        if(retryCount>3){
          
        console.error('Failed to send email, moving to retry queue:', error.message);
        channel.nack(message, false, false);
        }else{

          //EXPONENTIAL BACKOFF LOGIC
          console.log(`Sending to emailBackoffQueue${retryCount}`)
          const TTL = retryCount * 1000
          const queueName = `emailBackoffQueue${retryCount}`
          await channel.assertQueue(queueName, {
            durable: true,
            arguments: {
              'x-message-ttl': TTL,
              'x-dead-letter-exchange': 'exchange',
              'x-dead-letter-routing-key': 'email'
            }
          });
          await channel.bindQueue(queueName, "emailBackoffExchange","",headers )
          channel.publish("emailBackoffExchange", "", Buffer.from(JSON.stringify(msgContent)),{
            persistent:true,
            headers
          })
          channel.ack(message);

        }
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
