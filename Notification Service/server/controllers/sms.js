import axios from "axios";
import { smsProviders } from "../const.js";
import { sendToQueue } from '../rabbitmq.js';


export const enqueueSMS = async (req, res) => {
  const { phone, text } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone and text are required.' });
  }

  try {

    //Move to service
    await sendToQueue('sms_queue', { phone, text });
    res.status(200).json({ message: 'Message queued for processing.' });
  } catch (error) {
    console.error('Failed to enqueue message:', error.message);
    res.status(500).json({ error: 'Failed to enqueue message.' });
  }
};

const processSMS = async (providers, payload) => {
  for (const provider of providers) {
    try {
      // console.log('entered processsms')
      // console.log("payload")
      console.log(payload)
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
    channel.sendToQueue('sms_retry_queue', Buffer.from(message.content), {
            persistent: true,
          });
  }
};