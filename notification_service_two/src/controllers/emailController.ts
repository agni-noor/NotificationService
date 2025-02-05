import { Request, Response } from 'express';
import { sendToQueue } from '../services/emailService';

export const enqueueEmail = async (req: Request, res: Response): Promise<void> => {
  const { subject, body, recipients } = req.body;

  if (!subject || !body || !recipients) {
    res.status(400).json({ error: 'subject, body, and recipients are required.' });
    return;
  }

  try {
    await sendToQueue('email_queue', { subject, body, recipients });
    res.status(200).json({ message: 'Message queued for processing.' });
  } catch (error) {
    console.error('Failed to enqueue message:', (error as Error).message);
    res.status(500).json({ error: 'Failed to enqueue message.' });
  }
};
 