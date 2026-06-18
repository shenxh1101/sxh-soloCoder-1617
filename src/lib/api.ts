import type {
  Vehicle,
  Mechanic,
  RepairRecord,
  MaintenanceReminder,
  InsuranceReminder,
  FaultStat,
  MechanicStat,
} from '@shared/types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || `请求失败: ${res.status}`);
  }
  return res.json();
}

export const api = {
  vehicles: {
    list: (search?: string) =>
      request<Vehicle[]>(search ? `/vehicles?search=${encodeURIComponent(search)}` : '/vehicles'),
    get: (id: number) => request<Vehicle>(`/vehicles/${id}`),
    create: (data: Partial<Vehicle>) => request<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Vehicle>) =>
      request<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request<{ success: boolean }>(`/vehicles/${id}`, { method: 'DELETE' }),
  },
  mechanics: {
    list: () => request<Mechanic[]>('/mechanics'),
  },
  records: {
    list: (params?: { vehicleId?: number; month?: string }) => {
      const query = new URLSearchParams();
      if (params?.vehicleId) query.set('vehicleId', String(params.vehicleId));
      if (params?.month) query.set('month', params.month);
      const qs = query.toString();
      return request<RepairRecord[]>('/records' + (qs ? `?${qs}` : ''));
    },
    get: (id: number) => request<RepairRecord>(`/records/${id}`),
    create: (data: any) => request<RepairRecord>('/records', { method: 'POST', body: JSON.stringify(data) }),
  },
  reminders: {
    maintenance: () => request<MaintenanceReminder[]>('/reminders/maintenance'),
    insurance: () => request<InsuranceReminder[]>('/reminders/insurance'),
  },
  statistics: {
    faults: (month?: string) =>
      request<FaultStat[]>('/statistics/faults' + (month ? `?month=${month}` : '')),
    mechanics: (month?: string) =>
      request<MechanicStat[]>('/statistics/mechanics' + (month ? `?month=${month}` : '')),
    dashboard: () =>
      request<{
        monthRecords: number;
        totalVehicles: number;
        inProgress: number;
        maintenanceReminders: number;
        insuranceReminders: number;
      }>('/statistics/dashboard'),
  },
};
