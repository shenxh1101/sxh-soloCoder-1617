import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, User } from 'lucide-react';
import { api } from '@/lib/api';
import { REPAIR_ITEM_TYPES } from '@shared/types';
import type { Vehicle, Mechanic, RepairItemType } from '@shared/types';

interface FormItem {
  type: RepairItemType;
  name: string;
  cost: number;
}

export default function RecordForm() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [mileage, setMileage] = useState('');
  const [mechanicId, setMechanicId] = useState<number | ''>('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ type: 'oil', name: '换机油', cost: 0 }]);
  const [isMaintenance, setIsMaintenance] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.vehicles.list().then(setVehicles);
    api.mechanics.list().then(setMechanics);
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const selectedMechanic = mechanics.find((m) => m.id === mechanicId);
  const totalCost = items.reduce((s, it) => s + (it.cost || 0), 0);

  const addItem = () => setItems([...items, { type: 'other', name: '', cost: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<FormItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    if (patch.type !== undefined) {
      next[i].name = REPAIR_ITEM_TYPES.find((t) => t.type === patch.type)?.label || '';
    }
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !mileage) {
      alert('请选择车辆并填写里程数');
      return;
    }
    if (items.every((it) => !it.name.trim())) {
      alert('请至少添加一个维修项目');
      return;
    }
    const validItems = items.filter((it) => it.name.trim());
    setSubmitting(true);
    try {
      await api.records.create({
        vehicleId: Number(vehicleId),
        plate: selectedVehicle!.plate,
        ownerPhone: selectedVehicle!.ownerPhone,
        mileage: Number(mileage),
        mechanicId: mechanicId ? Number(mechanicId) : null,
        mechanicName: selectedMechanic?.name || '',
        totalCost,
        startTime,
        endTime: endTime || null,
        notes,
        repairItems: validItems,
        isMaintenance,
      });
      navigate('/records');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/records" className="btn-secondary !py-2 !px-3">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">新增维修记录</h2>
      </div>

      <form onSubmit={handleSubmit} className="card card-body space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="label">选择车辆 <span className="text-red-500">*</span></label>
            <select className="input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">请选择车辆</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} - {v.ownerName} ({v.carModel || '未填写车型'})</option>
              ))}
            </select>
            {selectedVehicle && (
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <div>📞 {selectedVehicle.ownerPhone}</div>
                {selectedVehicle.oilType && <div>🛢️ 机油: {selectedVehicle.oilType}</div>}
                {selectedVehicle.tireType && <div>🛞 轮胎: {selectedVehicle.tireType}</div>}
              </div>
            )}
          </div>
          <div>
            <label className="label">本次里程 (km) <span className="text-red-500">*</span></label>
            <input type="number" className="input" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="例如：45000" />
            {selectedVehicle && selectedVehicle.lastMaintenanceMileage > 0 && (
              <div className="mt-2 text-xs text-gray-500">上次保养里程：{selectedVehicle.lastMaintenanceMileage.toLocaleString()} km</div>
            )}
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-500" />
              维修师傅
            </label>
            <select className="input" value={mechanicId} onChange={(e) => setMechanicId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">请选择师傅</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">开始时间</label>
              <input type="datetime-local" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="label">结束时间</label>
              <input type="datetime-local" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">维修项目</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5" />
              添加项目
            </button>
          </div>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                  <label className="label">类型</label>
                  <select className="input" value={it.type} onChange={(e) => updateItem(i, { type: e.target.value as RepairItemType })}>
                    {REPAIR_ITEM_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-6">
                  <label className="label">项目名称</label>
                  <input className="input" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="项目名称" />
                </div>
                <div className="col-span-2">
                  <label className="label">费用 (¥)</label>
                  <input type="number" className="input" value={it.cost || ''} onChange={(e) => updateItem(i, { cost: Number(e.target.value) || 0 })} placeholder="0" />
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className="btn-danger !py-2 w-full disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isMaintenance} onChange={(e) => setIsMaintenance(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">本次算作保养（更新车辆下次保养里程）</span>
            </label>
            <div className="text-lg font-bold text-accent-600">合计：¥{totalCost.toFixed(0)}</div>
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="维修备注信息..." />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <Link to="/records" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Save className="w-4 h-4" />
            {submitting ? '保存中...' : '保存记录'}
          </button>
        </div>
      </form>
    </div>
  );
}
