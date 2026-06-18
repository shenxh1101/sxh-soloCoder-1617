export type RepairItemType = 'oil' | 'brake' | 'ac' | 'tire' | 'engine' | 'other';

export type FollowUpStatus = 'contacted' | 'next_week' | 'skip';

export interface Vehicle {
  id: number;
  plate: string;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  oilType: string;
  tireType: string;
  insuranceExpiry: string;
  insuranceCompany: string;
  lastMaintenanceMileage: number;
  lastMaintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mechanic {
  id: number;
  name: string;
  phone: string;
}

export interface RepairItem {
  id?: number;
  type: RepairItemType;
  name: string;
  cost: number;
}

export interface RepairRecord {
  id: number;
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
  createdAt: string;
  repairItems: RepairItem[];
}

export interface MaintenanceFollowUp {
  id: number;
  vehicleId: number;
  status: FollowUpStatus;
  note: string;
  createdAt: string;
}

export interface MaintenanceReminder {
  vehicleId: number;
  plate: string;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  lastMaintenanceMileage: number;
  lastMaintenanceDate: string;
  nextMaintenanceMileage: number;
  remainingMileage: number;
  isOverdue: boolean;
  lastFollowUp?: MaintenanceFollowUp;
}

export interface InsuranceReminder {
  vehicleId: number;
  plate: string;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  insuranceExpiry: string;
  insuranceCompany: string;
  remainingDays: number;
  isOverdue: boolean;
}

export interface FaultStat {
  type: RepairItemType;
  name: string;
  count: number;
}

export interface MechanicStat {
  mechanicId: number;
  mechanicName: string;
  totalRecords: number;
  avgDurationMinutes: number | null;
  totalRevenue: number;
}

export interface RevenueStat {
  totalRevenue: number;
  totalRecords: number;
  avgRevenue: number;
  byItem: { type: RepairItemType; name: string; revenue: number; count: number }[];
  byMechanic: { mechanicId: number; mechanicName: string; revenue: number; records: number }[];
}

export const FOLLOW_UP_OPTIONS: { value: FollowUpStatus; label: string; color: string }[] = [
  { value: 'contacted', label: '已联系', color: 'bg-green-100 text-green-700' },
  { value: 'next_week', label: '下周来', color: 'bg-blue-100 text-blue-700' },
  { value: 'skip', label: '暂不处理', color: 'bg-gray-100 text-gray-600' },
];

export const REPAIR_ITEM_TYPES: { type: RepairItemType; label: string }[] = [
  { type: 'oil', label: '换机油' },
  { type: 'brake', label: '换刹车片' },
  { type: 'ac', label: '修空调' },
  { type: 'tire', label: '换轮胎' },
  { type: 'engine', label: '发动机维修' },
  { type: 'other', label: '其他' },
];
