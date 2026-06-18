import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Wrench, Plus, Search, Eye, User } from 'lucide-react';
import { api } from '@/lib/api';
import type { RepairRecord } from '@shared/types';

export default function Records() {
  const [params, setParams] = useSearchParams();
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);

  const vehicleId = params.get('vehicleId');

  const load = () => {
    setLoading(true);
    api.records.list({
      vehicleId: vehicleId ? Number(vehicleId) : undefined,
      month: month || undefined,
    }).then(setRecords).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [vehicleId, month]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-44"
          />
          {vehicleId && (
            <button onClick={() => { setParams({}); }} className="btn-secondary text-xs">
              清除车辆筛选
            </button>
          )}
        </div>
        <Link to="/records/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增维修记录
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-3" />
            加载中...
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无维修记录</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>车牌</th>
                <th>里程</th>
                <th>维修项目</th>
                <th>维修师傅</th>
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
                  <td className="font-semibold text-gray-900">{r.plate}</td>
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
                  <td>
                    {r.mechanicName ? (
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {r.mechanicName}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
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
