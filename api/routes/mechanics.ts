import { Router } from 'express';
import { getAllMechanics } from '../services/mechanics.js';

const router = Router();

router.get('/', (_req, res) => {
  const mechanics = getAllMechanics();
  res.json(mechanics);
});

export default router;
