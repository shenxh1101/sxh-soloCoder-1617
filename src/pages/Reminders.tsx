import { useEffect, useState } from 'react';
import {
  Bell,
  ShieldAlert,
  Activity,
  CalendarClock,
  PhoneCall,
  Car,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { FOLLOW_UP_OPTIONS } from '@shared/types';
import type { MaintenanceReminder, InsuranceReminder, FollowUpStatus } from '@shared/types';

type Tab = 'maintenance' | 'insurance';

export default function Reminders() {
  const [tab, setTab] = useState<Tab>('maintenance');
  const [maintenance, setMaintenance] = useState<MaintenanceReminder[]>([]);
  const [insurance, setInsurance] = useState<InsuranceReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMaintenance = () =>
    api.reminders.maintenance().then(setMaintenance);

  useEffect(() => {
    Promise.all([loadMaintenance(), api.reminders.insurance()]).then(([, i]) => {
      setInsurance(i);
    }).finally(() => setLoading(false));
  }, []);

  const handleFollowUp = async (vehicleId: number, status: FollowUpStatus) => {
    await api.reminders.createFollowUp(vehicleId, status);
    await loadMaintenance();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setTab('maintenance')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'maintenance' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          保养提醒
          {maintenance.length > 0 && <span className="badge bg-orange-100 text-orange-700">{maintenance.length}</span>}
        </button>
        <button
          onClick={() => setTab('insurance')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === 'insurance' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          保险提醒
          {insurance.length > 0 && <span className="badge bg-red-100 text-red-700">{insurance.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
        </div>
      ) : tab === 'maintenance' ? (
        maintenance.length === 0 ? (
          <div className="card card-body text-center py-16 text-gray-400">
            <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium text-gray-600">暂无保养提醒</p>
            <p className="text-sm mt-1">所有车辆保养状态良好</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {maintenance.map((r) => (
              <div key={r.vehicleId} className={`card card-body !p-5 border-l-4 ${r.isOverdue ? 'border-l-red-500' : 'border-l-accent-500'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${r.isOverdue ? 'bg-red-50' : 'bg-orange-50'}`}>
                      {r.isOverdue ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Activity className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">{r.plate}</span>
                        {r.carModel && <span className="text-sm text-gray-500">{r.carModel}</span>}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{r.ownerName}</div>
                      <a href={`tel:${r.ownerPhone}`} className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1 mt-1">
                        <PhoneCall className="w-3 h-3" />
                        {r.ownerPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${r.ownerPhone}`} className="btn-accent !py-1.5 !px-3 text-xs">
                      <PhoneCall className="w-3.5 h-3.5" />
                      提醒客户
                    </a>
                    <div className="relative group">
                      <button className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                        跟进
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[110px]">
                        {FOLLOW_UP_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleFollowUp(r.vehicleId, opt.value)}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                          >
                            <span className={`inline-block w-2 h-2 rounded-full ${opt.color.split(' ')[0]}`} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg py-2">
                    <div className="text-xs text-gray-500">上次保养</div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">{r.lastMaintenanceMileage.toLocaleString()} km</div>
                  </div>
                  <div className="bg-primary-50 rounded-lg py-2">
                    <div className="text-xs text-gray-500">下次保养</div>
                    <div className="text-sm font-semibold text-primary-700 mt-0.5">{r.nextMaintenanceMileage.toLocaleString()} km</div>
                  </div>
                  <div className={`rounded-lg py-2 ${r.isOverdue ? 'bg-red-50' : 'bg-orange-50'}`}>
                    <div className="text-xs text-gray-500">{r.isOverdue ? '已超期' : '还剩'}</div>
                    <div className={`text-sm font-bold mt-0.5 ${r.isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                      {Math.abs(r.remainingMileage).toLocaleString()} km
                    </div>
                  </div>
                </div>
                {r.lastFollowUp && (() => {
                  const opt = FOLLOW_UP_OPTIONS.find(o => o.value === r.lastFollowUp!.status);
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <span className={`badge ${opt?.color || 'bg-gray-100 text-gray-600'}`}>{opt?.label}</span>
                      <span className="text-xs text-gray-400">{r.lastFollowUp.createdAt.slice(0, 16)}</span>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )
      ) : (
        insurance.length === 0 ? (
          <div className="card card-body text-center py-16 text-gray-400">
            <CheckCircle2 className="w-14 h-14 mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium text-gray-600">暂无保险到期提醒</p>
            <p className="text-sm mt-1">所有车辆保险均在有效期内</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {insurance.map((r) => {
              const urgent = r.remainingDays <= 7 || r.isOverdue;
              return (
                <div key={r.vehicleId} className={`card card-body !p-5 border-l-4 ${urgent ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
                        {urgent ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <CalendarClock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">{r.plate}</span>
                          {r.carModel && <span className="text-sm text-gray-500">{r.carModel}</span>}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{r.ownerName}</div>
                        <a href={`tel:${r.ownerPhone}`} className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1 mt-1">
                          <PhoneCall className="w-3 h-3" />
                          {r.ownerPhone}
                        </a>
                      </div>
                    </div>
                    <a href={`tel:${r.ownerPhone}`} className="btn-accent !py-1.5 !px-3 text-xs">
                      <PhoneCall className="w-3.5 h-3.5" />
                      续保提醒
                    </a>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg py-2">
                      <div className="text-xs text-gray-500">保险公司</div>
                      <div className="text-sm font-semibold text-gray-800 mt-0.5">{r.insuranceCompany || '-'}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg py-2">
                      <div className="text-xs text-gray-500">到期日期</div>
                      <div className="text-sm font-semibold text-blue-700 mt-0.5">{r.insuranceExpiry}</div>
                    </div>
                    <div className={`rounded-lg py-2 ${urgent ? 'bg-red-50' : 'bg-orange-50'}`}>
                      <div className="text-xs text-gray-500">{r.isOverdue ? '已过期' : '还剩'}</div>
                      <div className={`text-sm font-bold mt-0.5 ${urgent ? 'text-red-600' : 'text-orange-600'}`}>
                        {Math.abs(r.remainingDays)} 天
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
