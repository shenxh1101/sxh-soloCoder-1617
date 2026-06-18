import { Router } from 'express';
import { getAllRecords, getRecordById, createRecord } from '../services/records.js';

const router = Router();

router.get('/', (req, res) => {
  const vehicleId = req.query.vehicleId ? Number(req.query.vehicleId) : undefined;
  const month = req.query.month as string | undefined;
  const records = getAllRecords(vehicleId, month);
  res.json(records);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const record = getRecordById(id);
  if (!record) {
    res.status(404).json({ error: '记录不存在' });
    return;
  }
  res.json(record);
});

router.post('/', (req, res) => {
  try {
    const record = createRecord(req.body);
    res.status(201).json(record);
  } catch (e: any) {
    res.status(400).json({ error: e.message || '创建失败' });
  }
});

export default router;
