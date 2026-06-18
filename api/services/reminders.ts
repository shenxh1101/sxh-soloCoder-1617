import db from '../db/index.js';
import type { MaintenanceReminder, InsuranceReminder } from '../../shared/types.js';

const MAINTENANCE_INTERVAL_KM = 5000;
const MAINTENANCE_REMIND_THRESHOLD = 1000;
const INSURANCE_REMIND_DAYS = 30;

export function getMaintenanceReminders(): MaintenanceReminder[] {
  const rows = db.prepare(`
    SELECT 
      v.id as vehicle_id,
      v.plate,
      v.owner_name,
      v.owner_phone,
      v.car_model,
      v.last_maintenance_mileage,
      v.last_maintenance_date,
      COALESCE(MAX(rr.mileage), v.last_maintenance_mileage) as current_mileage
    FROM vehicles v
    LEFT JOIN repair_records rr ON rr.vehicle_id = v.id
    WHERE v.last_maintenance_mileage > 0
    GROUP BY v.id
    ORDER BY current_mileage DESC
  `).all();

  const reminders: MaintenanceReminder[] = [];
  for (const row of rows as any[]) {
    const lastMileage = row.last_maintenance_mileage || 0;
    const currentMileage = row.current_mileage || lastMileage;
    const nextMileage = lastMileage + MAINTENANCE_INTERVAL_KM;
    const remaining = nextMileage - currentMileage;

    if (remaining <= MAINTENANCE_REMIND_THRESHOLD) {
      reminders.push({
        vehicleId: row.vehicle_id,
        plate: row.plate,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone,
        carModel: row.car_model || '',
        lastMaintenanceMileage: lastMileage,
        lastMaintenanceDate: row.last_maintenance_date || '',
        nextMaintenanceMileage: nextMileage,
        remainingMileage: remaining,
        isOverdue: remaining < 0,
      });
    }
  }

  reminders.sort((a, b) => a.remainingMileage - b.remainingMileage);
  return reminders;
}

export function getInsuranceReminders(): InsuranceReminder[] {
  const rows = db.prepare(`
    SELECT * FROM vehicles 
    WHERE insurance_expiry IS NOT NULL AND insurance_expiry != ''
    ORDER BY insurance_expiry ASC
  `).all();

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const reminders: InsuranceReminder[] = [];

  for (const row of rows as any[]) {
    const expiry = new Date(row.insurance_expiry);
    expiry.setHours(0, 0, 0, 0);
    const diffMs = expiry.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= INSURANCE_REMIND_DAYS) {
      reminders.push({
        vehicleId: row.id,
        plate: row.plate,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone,
        carModel: row.car_model || '',
        insuranceExpiry: row.insurance_expiry,
        insuranceCompany: row.insurance_company || '',
        remainingDays,
        isOverdue: remainingDays < 0,
      });
    }
  }

  reminders.sort((a, b) => a.remainingDays - b.remainingDays);
  return reminders;
}
