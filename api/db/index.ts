import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'garage.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT NOT NULL UNIQUE,
      owner_name TEXT NOT NULL,
      owner_phone TEXT NOT NULL,
      car_model TEXT DEFAULT '',
      oil_type TEXT DEFAULT '',
      tire_type TEXT DEFAULT '',
      insurance_expiry TEXT DEFAULT '',
      insurance_company TEXT DEFAULT '',
      last_maintenance_mileage INTEGER DEFAULT 0,
      last_maintenance_date TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mechanics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS repair_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      plate TEXT NOT NULL,
      owner_phone TEXT NOT NULL,
      mileage INTEGER NOT NULL,
      mechanic_id INTEGER,
      mechanic_name TEXT DEFAULT '',
      total_cost REAL NOT NULL DEFAULT 0,
      start_time TEXT NOT NULL,
      end_time TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
    );

    CREATE TABLE IF NOT EXISTS repair_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      cost REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (record_id) REFERENCES repair_records(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS maintenance_follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
    CREATE INDEX IF NOT EXISTS idx_records_vehicle ON repair_records(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_records_start ON repair_records(start_time);
    CREATE INDEX IF NOT EXISTS idx_followups_vehicle ON maintenance_follow_ups(vehicle_id);
  `);

  const mechanicCount = db.prepare('SELECT COUNT(*) as count FROM mechanics').get() as { count: number };
  if (mechanicCount.count === 0) {
    const insertMechanic = db.prepare('INSERT INTO mechanics (name, phone) VALUES (?, ?)');
    insertMechanic.run('张师傅', '13800138001');
    insertMechanic.run('李师傅', '13800138002');
    insertMechanic.run('王师傅', '13800138003');
  }

  const vehicleCount = db.prepare('SELECT COUNT(*) as count FROM vehicles').get() as { count: number };
  if (vehicleCount.count === 0) {
    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (plate, owner_name, owner_phone, car_model, oil_type, tire_type, insurance_expiry, insurance_company, last_maintenance_mileage, last_maintenance_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertVehicle.run(
      '京A12345', '张三', '13900139001', '大众朗逸', '5W-30 全合成', '205/55R16',
      '2026-08-15', '平安保险', 45000, '2026-03-10'
    );
    insertVehicle.run(
      '京B67890', '李四', '13900139002', '丰田卡罗拉', '0W-20 全合成', '195/65R15',
      '2026-07-20', '人保财险', 38000, '2026-02-15'
    );
    insertVehicle.run(
      '京C11111', '王五', '13900139003', '本田雅阁', '5W-40 全合成', '225/50R17',
      '2025-12-30', '太平洋保险', 62000, '2026-01-05'
    );

    const insertRecord = db.prepare(`
      INSERT INTO repair_records (vehicle_id, plate, owner_phone, mileage, mechanic_id, mechanic_name, total_cost, start_time, end_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO repair_items (record_id, type, name, cost) VALUES (?, ?, ?, ?)
    `);

    const now = new Date();
    const daysAgo = (d: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      return date.toISOString().slice(0, 16);
    };

    const info = insertRecord.run(1, '京A12345', '13900139001', 45000, 1, '张师傅', 580, daysAgo(10), daysAgo(10), '常规保养');
    insertItem.run(info.lastInsertRowid, 'oil', '换机油机滤', 380);
    insertItem.run(info.lastInsertRowid, 'other', '空气滤芯', 200);

    const info2 = insertRecord.run(2, '京B67890', '13900139002', 38000, 2, '李师傅', 850, daysAgo(25), daysAgo(25), '刹车片磨损严重');
    insertItem.run(info2.lastInsertRowid, 'brake', '更换前刹车片', 650);
    insertItem.run(info2.lastInsertRowid, 'other', '刹车油', 200);

    const info3 = insertRecord.run(3, '京C11111', '13900139003', 62000, 3, '王师傅', 1200, daysAgo(40), daysAgo(39), '空调不制冷');
    insertItem.run(info3.lastInsertRowid, 'ac', '空调加氟', 300);
    insertItem.run(info3.lastInsertRowid, 'ac', '更换压缩机', 900);

    const info4 = insertRecord.run(1, '京A12345', '13900139001', 42000, 1, '张师傅', 450, daysAgo(60), daysAgo(60), '小保养');
    insertItem.run(info4.lastInsertRowid, 'oil', '换机油', 450);
  }
}

export default db;
