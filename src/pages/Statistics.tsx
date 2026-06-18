import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3, Trophy, Clock, Wrench, Medal } from 'lucide-react';
import { api } from '@/lib/api';
import type { FaultStat, MechanicStat } from '@shared/types';

const COLORS = ['#1e3a5f', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

export default function Statistics() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonth);
  const [faults, setFaults] = useState<FaultStat[]>([]);
  const [mechanics, setMechanics] = useState<MechanicStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.statistics.faults(month), api.statistics.mechanics(month)])
      .then(([f, m]) => {
        setFaults(f);
        setMechanics(m);
      })
      .finally(() => setLoading(false));
  }, [month]);

  const totalFaults = faults.reduce((s, f) => s + f.count, 0);
  const totalRecords = mechanics.reduce((s, m) => s + m.totalRecords, 0);
  const maxRecords = Math.max(...mechanics.map(m => m.totalRecords), 1);

  const mechanicsWithAvg = mechanics.filter(m => m.avgDurationMinutes !== null);
  const avgAllMinutes = mechanicsWithAvg.length > 0
    ? Math.round(mechanicsWithAvg.reduce((s, m) => s + (m.avgDurationMinutes || 0), 0) / mechanicsWithAvg.length)
    : 0;

  const maxRecordsValue = mechanics.reduce((max, m) => Math.max(max, m.totalRecords), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input w-44" />
        <span className="text-sm text-gray-500">按维修开始时间筛选</span>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="card card-body !p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalRecords}</div>
              <div className="text-sm text-gray-500">本月维修单数</div>
            </div>
          </div>
        </div>
        <div className="card card-body !p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalFaults}</div>
              <div className="text-sm text-gray-500">故障项目总数</div>
            </div>
          </div>
        </div>
        <div className="card card-body !p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{maxRecordsValue}</div>
              <div className="text-sm text-gray-500">最高单量</div>
            </div>
          </div>
        </div>
        <div className="card card-body !p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgAllMinutes || '—'}</div>
              <div className="text-sm text-gray-500">平均耗时 (分钟)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-800">故障类型统计</h2>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
              </div>
            ) : faults.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-400">本月暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={faults} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="数量">
                    {faults.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-800">师傅效率排名</h2>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
              </div>
            ) : mechanics.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-400">本月暂无数据</div>
            ) : (
              <div className="space-y-3">
                {mechanics.map((m, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const hasAvg = m.avgDurationMinutes !== null;
                  return (
                    <div key={m.mechanicId} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {hasAvg && medals[i] ? medals[i] : <Medal className="w-5 h-5 text-gray-400" />}
                          </span>
                          <span className="font-semibold text-gray-900">{m.mechanicName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary-700">{m.totalRecords} 单</div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all"
                          style={{ width: `${(m.totalRecords / maxRecords) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {hasAvg ? `平均耗时 ${m.avgDurationMinutes} 分钟` : '暂无完成记录'}
                        </span>
                        <span>单量占比 {((m.totalRecords / maxRecords) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
