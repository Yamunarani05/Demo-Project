import { Router, Request, Response } from 'express';
import { saveNewsletterSubscriber } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    const saved = await saveNewsletterSubscriber(email.trim().toLowerCase());

    return res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to Demo Project updates!',
      data: saved,
    });
  } catch (err: any) {
    console.error('Error in newsletter subscription:', err);
    return res.status(500).json({ error: 'Failed to subscribe to newsletter.' });
  }
});

export default router;
