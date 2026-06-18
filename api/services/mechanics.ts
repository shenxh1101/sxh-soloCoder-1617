import db from '../db/index.js';
import type { Mechanic } from '../../shared/types.js';

function rowToMechanic(row: any): Mechanic {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
  };
}

export function getAllMechanics(): Mechanic[] {
  const rows = db.prepare('SELECT * FROM mechanics ORDER BY id').all();
  return rows.map(rowToMechanic);
}

export function getMechanicById(id: number): Mechanic | null {
  const row = db.prepare('SELECT * FROM mechanics WHERE id = ?').get(id);
  return row ? rowToMechanic(row) : null;
}
