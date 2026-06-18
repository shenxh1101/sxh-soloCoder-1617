import db from '../db/index.js';
import type { FaultStat, MechanicStat, RepairItemType } from '../../shared/types.js';
import { REPAIR_ITEM_TYPES } from '../../shared/types.js';

export function getFaultStatistics(month?: string): FaultStat[] {
  let sql = `
    SELECT ri.type, COUNT(*) as count
    FROM repair_items ri
    JOIN repair_records rr ON ri.record_id = rr.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', rr.created_at) = ?';
    params.push(month);
  }

  sql += ' GROUP BY ri.type ORDER BY count DESC';
  const rows = db.prepare(sql).all(...params) as any[];

  const typeToName = new Map(REPAIR_ITEM_TYPES.map(t => [t.type, t.label]));
  return rows.map(row => ({
    type: row.type as RepairItemType,
    name: typeToName.get(row.type as RepairItemType) || row.type,
    count: row.count,
  }));
}

export function getMechanicStatistics(month?: string): MechanicStat[] {
  let sql = `
    SELECT 
      mechanic_id,
      mechanic_name,
      COUNT(*) as total_records,
      AVG(
        CASE 
          WHEN start_time IS NOT NULL AND end_time IS NOT NULL 
            THEN (julianday(end_time) - julianday(start_time)) * 24 * 60
          ELSE NULL 
        END
      ) as avg_duration
    FROM repair_records
    WHERE mechanic_id IS NOT NULL
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', created_at) = ?';
    params.push(month);
  }

  sql += ' GROUP BY mechanic_id, mechanic_name ORDER BY total_records DESC, avg_duration ASC';
  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map(row => ({
    mechanicId: row.mechanic_id,
    mechanicName: row.mechanic_name || '未命名',
    totalRecords: row.total_records,
    avgDurationMinutes: row.avg_duration ? Math.round(row.avg_duration) : 0,
  }));
}

export function getDashboardStats() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthRecords = (db.prepare(`
    SELECT COUNT(*) as count FROM repair_records WHERE strftime('%Y-%m', created_at) = ?
  `).get(currentMonth) as { count: number }).count;

  const totalVehicles = (db.prepare('SELECT COUNT(*) as count FROM vehicles').get() as { count: number }).count;

  const inProgress = (db.prepare(`
    SELECT COUNT(*) as count FROM repair_records WHERE end_time IS NULL OR end_time = ''
  `).get() as { count: number }).count;

  const maintenanceReminders = db.prepare(`
    SELECT COUNT(*) as count FROM vehicles WHERE last_maintenance_mileage > 0
  `).get() as { count: number };

  const MAINTENANCE_INTERVAL_KM = 5000;
  const MAINTENANCE_REMIND_THRESHOLD = 1000;
  const allVehicles = db.prepare('SELECT * FROM vehicles WHERE last_maintenance_mileage > 0').all() as any[];
  let remindCount = 0;
  for (const v of allVehicles) {
    const nextMileage = v.last_maintenance_mileage + MAINTENANCE_INTERVAL_KM;
    const currentEstimate = v.last_maintenance_mileage + 500;
    if (nextMileage - currentEstimate <= MAINTENANCE_REMIND_THRESHOLD) {
      remindCount++;
    }
  }

  const insuranceRows = db.prepare(`
    SELECT insurance_expiry FROM vehicles WHERE insurance_expiry IS NOT NULL AND insurance_expiry != ''
  `).all() as any[];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let insuranceRemindCount = 0;
  for (const row of insuranceRows) {
    const expiry = new Date(row.insurance_expiry);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30) insuranceRemindCount++;
  }

  return {
    monthRecords,
    totalVehicles,
    inProgress,
    maintenanceReminders: remindCount,
    insuranceReminders: insuranceRemindCount,
  };
}
