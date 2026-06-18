import { Router } from 'express';
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicles.js';

const router = Router();

router.get('/', (req, res) => {
  const search = req.query.search as string | undefined;
  const vehicles = getAllVehicles(search);
  res.json(vehicles);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const vehicle = getVehicleById(id);
  if (!vehicle) {
    res.status(404).json({ error: '车辆不存在' });
    return;
  }
  res.json(vehicle);
});

router.post('/', (req, res) => {
  try {
    const vehicle = createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(400).json({ error: '该车牌号已存在' });
    } else {
      res.status(400).json({ error: e.message || '创建失败' });
    }
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const vehicle = updateVehicle(id, req.body);
  if (!vehicle) {
    res.status(404).json({ error: '车辆不存在' });
    return;
  }
  res.json(vehicle);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const success = deleteVehicle(id);
  if (!success) {
    res.status(404).json({ error: '车辆不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
