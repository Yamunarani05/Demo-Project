import { Router, Request, Response } from 'express';
import { saveContact } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ error: 'Message must be at least 5 characters long' });
    }

    const saved = await saveContact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : undefined,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team will get back to you shortly.',
      data: saved,
    });
  } catch (err: any) {
    console.error('Error saving contact request:', err);
    return res.status(500).json({ error: 'An unexpected error occurred while processing your message.' });
  }
});

export default router;
