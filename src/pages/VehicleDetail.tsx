import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Car, Droplets, CircleDot, PhoneCall, Edit2, Plus, Eye, Wrench, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { Vehicle, RepairRecord } from '@shared/types';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [v, r] = await Promise.all([
          api.vehicles.get(Number(id)),
          api.records.list({ vehicleId: Number(id) }),
        ]);
        setVehicle(v);
        const sorted = [...r].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setRecords(sorted);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="card card-body text-center py-12 text-gray-500">
        车辆不存在
        <div className="mt-4"><Link to="/vehicles" className="btn-primary">返回列表</Link></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">{vehicle.plate}</div>
              <div className="text-sm text-gray-500">{vehicle.carModel || '-'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/vehicles/${vehicle.id}/edit`} className="btn-secondary">
              <Edit2 className="w-4 h-4" />
              编辑
            </Link>
            <Link to={`/records/new?vehicleId=${vehicle.id}`} className="btn-primary">
              <Plus className="w-4 h-4" />
              新增维修记录
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                车主姓名
              </div>
              <div className="font-medium text-gray-900">{vehicle.ownerName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                联系电话
              </div>
              <a href={`tel:${vehicle.ownerPhone}`} className="font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                {vehicle.ownerPhone}
              </a>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                车型
              </div>
              <div className="font-medium text-gray-900">{vehicle.carModel || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                机油型号
              </div>
              {vehicle.oilType ? (
                <span className="badge bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {vehicle.oilType}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <CircleDot className="w-3.5 h-3.5" />
                轮胎型号
              </div>
              {vehicle.tireType ? (
                <span className="badge bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                  <CircleDot className="w-3 h-3" />
                  {vehicle.tireType}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                上次保养
              </div>
              {vehicle.lastMaintenanceMileage ? (
                <div>
                  <div className="font-medium text-gray-900">{vehicle.lastMaintenanceMileage.toLocaleString()} km</div>
                  <div className="text-xs text-gray-400">{vehicle.lastMaintenanceDate}</div>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                保险信息
              </div>
              {vehicle.insuranceExpiry ? (
                <div>
                  <div className="font-medium text-gray-900">{vehicle.insuranceExpiry}</div>
                  {vehicle.insuranceCompany && (
                    <div className="text-xs text-gray-400">{vehicle.insuranceCompany}</div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800">维修历史</h3>
          </div>
          <div className="text-sm text-gray-500">共 {records.length} 条记录</div>
        </div>
        {records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无维修记录</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>维修日期</th>
                <th>里程</th>
                <th>维修项目</th>
                <th>师傅</th>
                <th>费用</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="text-gray-900">{r.startTime.slice(0, 10)}</div>
                    <div className="text-xs text-gray-400">{r.startTime.slice(11, 16)}</div>
                  </td>
                  <td className="text-gray-600">{r.mileage.toLocaleString()} km</td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {r.repairItems.slice(0, 3).map((it, i) => (
                        <span key={i} className="badge bg-primary-50 text-primary-700">{it.name}</span>
                      ))}
                      {r.repairItems.length > 3 && (
                        <span className="badge bg-gray-100 text-gray-600">+{r.repairItems.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-gray-700">{r.mechanicName || '-'}</td>
                  <td className="font-semibold text-accent-600">¥{r.totalCost.toFixed(0)}</td>
                  <td className="text-right">
                    <Link to={`/records/${r.id}`} className="btn-secondary !py-1 !px-2 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
