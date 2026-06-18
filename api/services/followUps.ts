import db from '../db/index.js';
import type { MaintenanceFollowUp, FollowUpStatus } from '../../shared/types.js';

function rowToFollowUp(row: any): MaintenanceFollowUp {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    status: row.status as FollowUpStatus,
    note: row.note || '',
    createdAt: row.created_at,
  };
}

export function getFollowUpsByVehicle(vehicleId: number): MaintenanceFollowUp[] {
  const rows = db.prepare(
    'SELECT * FROM maintenance_follow_ups WHERE vehicle_id = ? ORDER BY created_at DESC'
  ).all(vehicleId);
  return (rows as any[]).map(rowToFollowUp);
}

export function getLastFollowUpByVehicle(vehicleId: number): MaintenanceFollowUp | null {
  const row = db.prepare(
    'SELECT * FROM maintenance_follow_ups WHERE vehicle_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(vehicleId);
  return row ? rowToFollowUp(row) : null;
}

export function createFollowUp(
  vehicleId: number,
  status: FollowUpStatus,
  note?: string
): MaintenanceFollowUp {
  const info = db.prepare(
    'INSERT INTO maintenance_follow_ups (vehicle_id, status, note) VALUES (?, ?, ?)'
  ).run(vehicleId, status, note || '');
  return getFollowUpsByVehicle(vehicleId)[0];
}

export function getAllLastFollowUps(): Map<number, MaintenanceFollowUp> {
  const rows = db.prepare(`
    SELECT f.*
    FROM maintenance_follow_ups f
    INNER JOIN (
      SELECT vehicle_id, MAX(created_at) as max_created
      FROM maintenance_follow_ups
      GROUP BY vehicle_id
    ) m ON f.vehicle_id = m.vehicle_id AND f.created_at = m.max_created
  `).all();
  const map = new Map<number, MaintenanceFollowUp>();
  for (const row of rows as any[]) {
    map.set(row.vehicle_id, rowToFollowUp(row));
  }
  return map;
}
