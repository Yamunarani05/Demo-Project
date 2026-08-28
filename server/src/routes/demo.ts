import { Router, Request, Response } from 'express';
import { saveDemoRequest } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, company, team_size, plan_interest, notes } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    const saved = await saveDemoRequest({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : undefined,
      team_size: team_size ? team_size.trim() : undefined,
      plan_interest: plan_interest ? plan_interest.trim() : 'Studio',
      notes: notes ? notes.trim() : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Demo request received! Our solution specialist will contact you with access details.',
      data: saved,
    });
  } catch (err: any) {
    console.error('Error saving demo request:', err);
    return res.status(500).json({ error: 'An error occurred while setting up your demo request.' });
  }
});

export default router;
