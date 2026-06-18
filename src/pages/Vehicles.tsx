import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Edit2, Trash2, PhoneCall, FileText, Droplets, CircleDot, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import type { Vehicle } from '@shared/types';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.vehicles.list(search).then(setVehicles).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (v: Vehicle) => {
    if (confirm(`确定删除车辆 ${v.plate}？相关维修记录将保留。`)) {
      try {
        await api.vehicles.remove(v.id);
        load();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-96 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            type="text"
            placeholder="搜索车牌或车主姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input pl-9"
          />
        </div>
        <Link to="/vehicles/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          添加车辆
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-3" />
            加载中...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无车辆，点击右上角添加第一辆车</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>车牌</th>
                <th>车主</th>
                <th>车型</th>
                <th>机油型号</th>
                <th>轮胎型号</th>
                <th>上次保养</th>
                <th>保险到期</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900">{v.plate}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-900 font-medium">{v.ownerName}</div>
                    <a href={`tel:${v.ownerPhone}`} className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-3 h-3" />
                      {v.ownerPhone}
                    </a>
                  </td>
                  <td className="text-gray-600">{v.carModel || '-'}</td>
                  <td>
                    {v.oilType ? (
                      <span className="badge bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {v.oilType}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    {v.tireType ? (
                      <span className="badge bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                        <CircleDot className="w-3 h-3" />
                        {v.tireType}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    {v.lastMaintenanceMileage ? (
                      <div>
                        <div className="text-gray-900">{v.lastMaintenanceMileage.toLocaleString()} km</div>
                        <div className="text-xs text-gray-400">{v.lastMaintenanceDate}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>
                    {v.insuranceExpiry ? (
                      <div>
                        <div className="text-gray-900">{v.insuranceExpiry}</div>
                        {v.insuranceCompany && (
                          <div className="text-xs text-gray-400">{v.insuranceCompany}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link to={`/vehicles/${v.id}`} className="btn-secondary !py-1 !px-2 text-xs" title="查看详情">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link to={`/records?vehicleId=${v.id}`} className="btn-secondary !py-1 !px-2 text-xs" title="查看维修记录">
                        <FileText className="w-3.5 h-3.5" />
                      </Link>
                      <Link to={`/vehicles/${v.id}/edit`} className="btn-secondary !py-1 !px-2 text-xs" title="编辑">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleDelete(v)} className="btn-danger !py-1 !px-2 text-xs" title="删除">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
