import { Router } from 'express';
import { getMaintenanceReminders, getInsuranceReminders } from '../services/reminders.js';

const router = Router();

router.get('/maintenance', (_req, res) => {
  const reminders = getMaintenanceReminders();
  res.json(reminders);
});

router.get('/insurance', (_req, res) => {
  const reminders = getInsuranceReminders();
  res.json(reminders);
});

export default router;
