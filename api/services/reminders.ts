import db from '../db/index.js';
import type { MaintenanceReminder, InsuranceReminder } from '../../shared/types.js';

const MAINTENANCE_INTERVAL_KM = 5000;
const MAINTENANCE_REMIND_THRESHOLD = 1000;
const INSURANCE_REMIND_DAYS = 30;

export function getMaintenanceReminders(): MaintenanceReminder[] {
  const rows = db.prepare(`
    SELECT * FROM vehicles 
    WHERE last_maintenance_mileage > 0
    ORDER BY last_maintenance_mileage ASC
  `).all();

  const reminders: MaintenanceReminder[] = [];
  for (const row of rows as any[]) {
    const nextMileage = row.last_maintenance_mileage + MAINTENANCE_INTERVAL_KM;
    const currentEstimate = row.last_maintenance_mileage + 500;
    const remaining = nextMileage - currentEstimate;

    if (remaining <= MAINTENANCE_REMIND_THRESHOLD) {
      reminders.push({
        vehicleId: row.id,
        plate: row.plate,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone,
        carModel: row.car_model || '',
        lastMaintenanceMileage: row.last_maintenance_mileage,
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
