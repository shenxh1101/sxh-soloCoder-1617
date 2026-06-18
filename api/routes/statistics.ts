import { Router } from 'express';
import { getFaultStatistics, getMechanicStatistics, getDashboardStats } from '../services/statistics.js';

const router = Router();

router.get('/faults', (req, res) => {
  const month = req.query.month as string | undefined;
  const stats = getFaultStatistics(month);
  res.json(stats);
});

router.get('/mechanics', (req, res) => {
  const month = req.query.month as string | undefined;
  const stats = getMechanicStatistics(month);
  res.json(stats);
});

router.get('/dashboard', (_req, res) => {
  const stats = getDashboardStats();
  res.json(stats);
});

export default router;
