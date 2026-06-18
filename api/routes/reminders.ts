import { Router } from 'express';
import { getMaintenanceReminders, getInsuranceReminders } from '../services/reminders.js';
import { createFollowUp, getFollowUpsByVehicle } from '../services/followUps.js';

const router = Router();

router.get('/maintenance', (_req, res) => {
  const reminders = getMaintenanceReminders();
  res.json(reminders);
});

router.get('/insurance', (_req, res) => {
  const reminders = getInsuranceReminders();
  res.json(reminders);
});

router.post('/follow-ups', (req, res) => {
  try {
    const { vehicleId, status, note } = req.body as { vehicleId: number; status: string; note?: string };
    if (!vehicleId || !status) {
      res.status(400).json({ error: '参数不完整' });
      return;
    }
    const followUp = createFollowUp(vehicleId, status as any, note);
    res.status(201).json(followUp);
  } catch (e: any) {
    res.status(400).json({ error: e.message || '创建失败' });
  }
});

router.get('/follow-ups/:vehicleId', (req, res) => {
  const vehicleId = Number(req.params.vehicleId);
  const followUps = getFollowUpsByVehicle(vehicleId);
  res.json(followUps);
});

export default router;
