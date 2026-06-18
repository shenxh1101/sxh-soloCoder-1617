import db from '../db/index.js';
import type { RepairRecord, RepairItem } from '../../shared/types.js';
import { updateMaintenanceInfo, getVehicleById } from './vehicles.js';

function rowToRecord(row: any, items: RepairItem[]): RepairRecord {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    plate: row.plate,
    ownerPhone: row.owner_phone,
    mileage: row.mileage,
    mechanicId: row.mechanic_id,
    mechanicName: row.mechanic_name || '',
    totalCost: row.total_cost,
    startTime: row.start_time,
    endTime: row.end_time,
    notes: row.notes || '',
    createdAt: row.created_at,
    repairItems: items,
  };
}

function getItemsForRecord(recordId: number): RepairItem[] {
  const rows = db.prepare('SELECT * FROM repair_items WHERE record_id = ? ORDER BY id').all(recordId);
  return rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    name: row.name,
    cost: row.cost,
  }));
}

export function getAllRecords(vehicleId?: number, month?: string): RepairRecord[] {
  let sql = 'SELECT * FROM repair_records WHERE 1=1';
  const params: any[] = [];

  if (vehicleId) {
    sql += ' AND vehicle_id = ?';
    params.push(vehicleId);
  }
  if (month) {
    sql += ' AND strftime(\'%Y-%m\', created_at) = ?';
    params.push(month);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  return rows.map((row: any) => rowToRecord(row, getItemsForRecord(row.id)));
}

export function getRecordById(id: number): RepairRecord | null {
  const row = db.prepare('SELECT * FROM repair_records WHERE id = ?').get(id);
  if (!row) return null;
  return rowToRecord(row, getItemsForRecord(id));
}

export interface CreateRecordData {
  vehicleId: number;
  plate: string;
  ownerPhone: string;
  mileage: number;
  mechanicId: number | null;
  mechanicName: string;
  totalCost: number;
  startTime: string;
  endTime: string | null;
  notes: string;
  repairItems: Omit<RepairItem, 'id'>[];
  isMaintenance: boolean;
}

export function createRecord(data: CreateRecordData): RepairRecord {
  const tx = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO repair_records (vehicle_id, plate, owner_phone, mileage, mechanic_id, mechanic_name, total_cost, start_time, end_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.vehicleId,
      data.plate,
      data.ownerPhone,
      data.mileage,
      data.mechanicId,
      data.mechanicName,
      data.totalCost,
      data.startTime,
      data.endTime,
      data.notes,
    );

    const recordId = Number(info.lastInsertRowid);
    const insertItem = db.prepare('INSERT INTO repair_items (record_id, type, name, cost) VALUES (?, ?, ?, ?)');
    for (const item of data.repairItems) {
      insertItem.run(recordId, item.type, item.name, item.cost);
    }

    if (data.isMaintenance) {
      const vehicle = getVehicleById(data.vehicleId);
      if (vehicle && data.mileage > vehicle.lastMaintenanceMileage) {
        const date = data.startTime ? data.startTime.slice(0, 10) : new Date().toISOString().slice(0, 10);
        updateMaintenanceInfo(data.vehicleId, data.mileage, date);
      }
    }

    return getRecordById(recordId)!;
  });

  return tx();
}
