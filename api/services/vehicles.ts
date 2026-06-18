import db from '../db/index.js';
import type { Vehicle } from '../../shared/types.js';

function rowToVehicle(row: any): Vehicle {
  return {
    id: row.id,
    plate: row.plate,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    carModel: row.car_model || '',
    oilType: row.oil_type || '',
    tireType: row.tire_type || '',
    insuranceExpiry: row.insurance_expiry || '',
    insuranceCompany: row.insurance_company || '',
    lastMaintenanceMileage: row.last_maintenance_mileage || 0,
    lastMaintenanceDate: row.last_maintenance_date || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllVehicles(search?: string): Vehicle[] {
  let sql = 'SELECT * FROM vehicles ORDER BY updated_at DESC';
  const params: any[] = [];
  if (search && search.trim()) {
    sql = 'SELECT * FROM vehicles WHERE plate LIKE ? OR owner_name LIKE ? ORDER BY updated_at DESC';
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  const rows = db.prepare(sql).all(...params);
  return rows.map(rowToVehicle);
}

export function getVehicleById(id: number): Vehicle | null {
  const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
  return row ? rowToVehicle(row) : null;
}

export function getVehicleByPlate(plate: string): Vehicle | null {
  const row = db.prepare('SELECT * FROM vehicles WHERE plate = ?').get(plate);
  return row ? rowToVehicle(row) : null;
}

export function createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle {
  const info = db.prepare(`
    INSERT INTO vehicles (plate, owner_name, owner_phone, car_model, oil_type, tire_type, insurance_expiry, insurance_company, last_maintenance_mileage, last_maintenance_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.plate,
    data.ownerName,
    data.ownerPhone,
    data.carModel,
    data.oilType,
    data.tireType,
    data.insuranceExpiry,
    data.insuranceCompany,
    data.lastMaintenanceMileage,
    data.lastMaintenanceDate,
  );
  return getVehicleById(Number(info.lastInsertRowid))!;
}

export function updateVehicle(id: number, data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Vehicle | null {
  const fields: string[] = [];
  const params: any[] = [];

  const fieldMap: Record<string, string> = {
    plate: 'plate',
    ownerName: 'owner_name',
    ownerPhone: 'owner_phone',
    carModel: 'car_model',
    oilType: 'oil_type',
    tireType: 'tire_type',
    insuranceExpiry: 'insurance_expiry',
    insuranceCompany: 'insurance_company',
    lastMaintenanceMileage: 'last_maintenance_mileage',
    lastMaintenanceDate: 'last_maintenance_date',
  };

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && fieldMap[key]) {
      fields.push(`${fieldMap[key]} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return getVehicleById(id);

  fields.push('updated_at = datetime(\'now\')');
  params.push(id);

  db.prepare(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return getVehicleById(id);
}

export function deleteVehicle(id: number): boolean {
  const info = db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
  return info.changes > 0;
}

export function updateMaintenanceInfo(vehicleId: number, mileage: number, date: string) {
  db.prepare(`
    UPDATE vehicles 
    SET last_maintenance_mileage = ?, last_maintenance_date = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(mileage, date, vehicleId);
}
