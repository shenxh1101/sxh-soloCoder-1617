import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, User, Phone, Calendar, DollarSign, FileText, Clock, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import type { RepairRecord } from '@shared/types';

export default function RecordDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState<RepairRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.records.get(Number(id)).then(setRecord).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="card card-body text-center py-12 text-gray-500">
        记录不存在
        <div className="mt-4"><Link to="/records" className="btn-primary">返回列表</Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/records" className="btn-secondary !py-2 !px-3">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">维修记录详情</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">{record.plate}</div>
              <div className="text-sm text-gray-500">{record.createdAt.slice(0, 10)}</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-accent-600">¥{record.totalCost.toFixed(0)}</div>
        </div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-4 gap-5">
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3.5 h-3.5" />车主电话</div>
              <a href={`tel:${record.ownerPhone}`} className="font-medium text-primary-600 hover:underline inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {record.ownerPhone}
              </a>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">里程数</div>
              <div className="font-medium text-gray-900">{record.mileage.toLocaleString()} km</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3.5 h-3.5" />维修师傅</div>
              <div className="font-medium text-gray-900">{record.mechanicName || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />耗时</div>
              <div className="font-medium text-gray-900">
                {record.endTime ? (
                  `${Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000)} 分钟`
                ) : '未完成'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary-500" />
              维修项目
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>项目名称</th>
                  <th className="text-right">费用</th>
                </tr>
              </thead>
              <tbody>
                {record.repairItems.map((it, i) => (
                  <tr key={i}>
                    <td><span className="badge bg-primary-50 text-primary-700">{it.type}</span></td>
                    <td className="text-gray-900">{it.name}</td>
                    <td className="text-right font-medium text-gray-900">¥{it.cost.toFixed(0)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="text-right font-semibold text-gray-700">合计</td>
                  <td className="text-right font-bold text-accent-600">¥{record.totalCost.toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {record.notes && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                备注
              </h3>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

