import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Wrench,
  Bell,
  ShieldAlert,
  Plus,
  PhoneCall,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { MaintenanceReminder, InsuranceReminder } from '@shared/types';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [insuranceReminders, setInsuranceReminders] = useState<InsuranceReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.statistics.dashboard(),
      api.reminders.maintenance(),
      api.reminders.insurance(),
    ]).then(([s, m, i]) => {
      setStats(s);
      setMaintenanceReminders(m);
      setInsuranceReminders(i);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: '本月维修', value: stats.monthRecords, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '车辆总数', value: stats.totalVehicles, icon: Car, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '保养待提醒', value: stats.maintenanceReminders, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '保险到期提醒', value: stats.insuranceReminders, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  ] : [];

  const combinedReminders = [
    ...maintenanceReminders.slice(0, 5).map((r) => ({
      ...r,
      type: 'maintenance' as const,
      title: `${r.plate} 保养提醒`,
      desc: `下次保养里程 ${r.nextMaintenanceMileage.toLocaleString()}km，${
        r.isOverdue ? `已超 ${Math.abs(r.remainingMileage).toLocaleString()}km` : `还剩 ${r.remainingMileage.toLocaleString()}km`
      }`,
      danger: r.isOverdue,
    })),
    ...insuranceReminders.slice(0, 5).map((r) => ({
      ...r,
      type: 'insurance' as const,
      title: `${r.plate} 保险到期`,
      desc: `${r.insuranceCompany || '保险'} ${r.insuranceExpiry} 到期，${
        r.isOverdue ? `已过期 ${Math.abs(r.remainingDays)} 天` : `还剩 ${r.remainingDays} 天`
      }`,
      danger: r.remainingDays <= 7 || r.isOverdue,
    })),
  ].sort((a, b) => Number(b.danger) - Number(a.danger)).slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="card card-body !p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent-500" />
              <h2 className="font-semibold text-gray-800">待办提醒</h2>
              <span className="badge bg-red-100 text-red-700">{combinedReminders.length} 项</span>
            </div>
            <Link to="/reminders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="card-body">
            {combinedReminders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无待办提醒</p>
              </div>
            ) : (
              <div className="space-y-3">
                {combinedReminders.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      r.danger ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${
                        r.danger ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {r.type === 'maintenance' ? (
                          <Activity className={`w-4 h-4 ${r.danger ? 'text-red-600' : 'text-orange-600'}`} />
                        ) : (
                          <CalendarClock className={`w-4 h-4 ${r.danger ? 'text-red-600' : 'text-orange-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${r.danger ? 'text-red-800' : 'text-orange-800'}`}>{r.title}</div>
                        <div className={`text-sm mt-0.5 ${r.danger ? 'text-red-600' : 'text-orange-600'}`}>{r.desc}</div>
                      </div>
                    </div>
                    <a
                      href={`tel:${r.ownerPhone}`}
                      className="btn-accent !py-1.5 !px-3 text-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      拨打电话
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">快捷操作</h2>
          </div>
          <div className="card-body space-y-3">
            <Link to="/records/new" className="flex items-center gap-3 p-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">新增维修记录</div>
                <div className="text-xs text-primary-200 mt-0.5">记录车辆维修信息</div>
              </div>
              <TrendingUp className="w-5 h-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/vehicles/new" className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">添加车辆档案</div>
                <div className="text-xs text-gray-500 mt-0.5">录入新车信息</div>
              </div>
              <TrendingUp className="w-5 h-5 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/statistics" className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">查看统计报表</div>
                <div className="text-xs text-gray-500 mt-0.5">故障与师傅效率分析</div>
              </div>
              <TrendingUp className="w-5 h-5 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

