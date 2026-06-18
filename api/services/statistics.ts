import db from '../db/index.js';
import type { FaultStat, MechanicStat, RepairItemType, RevenueStat } from '../../shared/types.js';
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
    sql += ' AND strftime(\'%Y-%m\', rr.start_time) = ?';
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
          WHEN start_time IS NOT NULL AND end_time IS NOT NULL AND end_time != ''
            THEN (julianday(end_time) - julianday(start_time)) * 24 * 60
          ELSE NULL 
        END
      ) as avg_duration,
      SUM(total_cost) as total_revenue
    FROM repair_records
    WHERE mechanic_id IS NOT NULL
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', start_time) = ?';
    params.push(month);
  }

  sql += ' GROUP BY mechanic_id, mechanic_name';
  const rows = db.prepare(sql).all(...params) as any[];

  const withAvg = rows.filter((r: any) => r.avg_duration !== null).sort((a: any, b: any) => a.avg_duration - b.avg_duration);
  const withoutAvg = rows.filter((r: any) => r.avg_duration === null);

  const sorted = [...withAvg, ...withoutAvg];

  return sorted.map(row => ({
    mechanicId: row.mechanic_id,
    mechanicName: row.mechanic_name || '未命名',
    totalRecords: row.total_records,
    avgDurationMinutes: row.avg_duration ? Math.round(row.avg_duration) : null,
    totalRevenue: row.total_revenue || 0,
  }));
}

export function getRevenueStatistics(month?: string): RevenueStat {
  const params: any[] = [];
  let where = 'WHERE 1=1';
  if (month) {
    where = 'WHERE strftime(\'%Y-%m\', start_time) = ?';
    params.push(month);
  }

  const totals = (db.prepare(`
    SELECT SUM(total_cost) as total_revenue, COUNT(*) as total_records
    FROM repair_records
    ${where}
  `).get(...params) as { total_revenue: number; total_records: number }) || { total_revenue: 0, total_records: 0 };

  const byItemRows = db.prepare(`
    SELECT ri.type, SUM(ri.cost) as revenue, COUNT(*) as count
    FROM repair_items ri
    JOIN repair_records rr ON ri.record_id = rr.id
    ${where}
    GROUP BY ri.type
    ORDER BY revenue DESC
  `).all(...params) as any[];

  const typeToName = new Map(REPAIR_ITEM_TYPES.map(t => [t.type, t.label]));
  const byItem = byItemRows.map(row => ({
    type: row.type as RepairItemType,
    name: typeToName.get(row.type as RepairItemType) || row.type,
    revenue: row.revenue || 0,
    count: row.count,
  }));

  let byMechanicWhere = where + ' AND mechanic_id IS NOT NULL';
  const mechanicParams = [...params];
  const byMechanicRows = db.prepare(`
    SELECT mechanic_id, mechanic_name, SUM(total_cost) as revenue, COUNT(*) as records
    FROM repair_records
    ${byMechanicWhere}
    GROUP BY mechanic_id, mechanic_name
    ORDER BY revenue DESC
  `).all(...mechanicParams) as any[];

  const byMechanic = byMechanicRows.map(row => ({
    mechanicId: row.mechanic_id,
    mechanicName: row.mechanic_name || '未命名',
    revenue: row.revenue || 0,
    records: row.records,
  }));

  return {
    totalRevenue: totals.total_revenue || 0,
    totalRecords: totals.total_records || 0,
    avgRevenue: totals.total_records > 0 ? (totals.total_revenue || 0) / totals.total_records : 0,
    byItem,
    byMechanic,
  };
}

export function getDashboardStats() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthRecords = (db.prepare(`
    SELECT COUNT(*) as count FROM repair_records WHERE strftime('%Y-%m', start_time) = ?
  `).get(currentMonth) as { count: number }).count;

  const totalVehicles = (db.prepare('SELECT COUNT(*) as count FROM vehicles').get() as { count: number }).count;

  const inProgress = (db.prepare(`
    SELECT COUNT(*) as count FROM repair_records WHERE end_time IS NULL OR end_time = ''
  `).get() as { count: number }).count;

  const MAINTENANCE_INTERVAL_KM = 5000;
  const MAINTENANCE_REMIND_THRESHOLD = 1000;

  const vehicleMileages = db.prepare(`
    SELECT 
      v.id,
      v.last_maintenance_mileage,
      COALESCE(MAX(rr.mileage), v.last_maintenance_mileage) as current_mileage
    FROM vehicles v
    LEFT JOIN repair_records rr ON rr.vehicle_id = v.id
    WHERE v.last_maintenance_mileage > 0
    GROUP BY v.id
  `).all() as any[];

  let maintenanceReminders = 0;
  for (const v of vehicleMileages) {
    const nextMileage = v.last_maintenance_mileage + MAINTENANCE_INTERVAL_KM;
    const current = v.current_mileage || v.last_maintenance_mileage;
    if (nextMileage - current <= MAINTENANCE_REMIND_THRESHOLD) {
      maintenanceReminders++;
    }
  }

  const insuranceRows = db.prepare(`
    SELECT insurance_expiry FROM vehicles WHERE insurance_expiry IS NOT NULL AND insurance_expiry != ''
  `).all() as any[];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let insuranceReminders = 0;
  for (const row of insuranceRows) {
    const expiry = new Date(row.insurance_expiry);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30) insuranceReminders++;
  }

  const monthRevenue = (db.prepare(`
    SELECT COALESCE(SUM(total_cost), 0) as revenue FROM repair_records WHERE strftime('%Y-%m', start_time) = ?
  `).get(currentMonth) as { revenue: number }).revenue;

  return {
    monthRecords,
    totalVehicles,
    inProgress,
    maintenanceReminders,
    insuranceReminders,
    monthRevenue,
  };
}
