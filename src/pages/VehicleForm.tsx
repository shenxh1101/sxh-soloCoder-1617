import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Car, User, Phone, Calendar, Droplets, CircleDot, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import type { Vehicle } from '@shared/types';

const empty: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> = {
  plate: '',
  ownerName: '',
  ownerPhone: '',
  carModel: '',
  oilType: '',
  tireType: '',
  insuranceExpiry: '',
  insuranceCompany: '',
  lastMaintenanceMileage: 0,
  lastMaintenanceDate: '',
};

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.vehicles.get(Number(id)).then((v) => {
        setForm({
          plate: v.plate,
          ownerName: v.ownerName,
          ownerPhone: v.ownerPhone,
          carModel: v.carModel,
          oilType: v.oilType,
          tireType: v.tireType,
          insuranceExpiry: v.insuranceExpiry,
          insuranceCompany: v.insuranceCompany,
          lastMaintenanceMileage: v.lastMaintenanceMileage,
          lastMaintenanceDate: v.lastMaintenanceDate,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate.trim() || !form.ownerName.trim() || !form.ownerPhone.trim()) {
      alert('请填写车牌、车主姓名和电话');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.vehicles.update(Number(id), form);
      } else {
        await api.vehicles.create(form);
      }
      navigate('/vehicles');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/vehicles" className="btn-secondary !py-2 !px-3">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">{isEdit ? '编辑车辆' : '添加车辆'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="card card-body space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="label flex items-center gap-1.5">
              <Car className="w-4 h-4 text-primary-500" />
              车牌号 <span className="text-red-500">*</span>
            </label>
            <input className="input" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="例如：京A12345" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-500" />
              车主姓名 <span className="text-red-500">*</span>
            </label>
            <input className="input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="车主姓名" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary-500" />
              车主电话 <span className="text-red-500">*</span>
            </label>
            <input className="input" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} placeholder="联系电话" />
          </div>
          <div>
            <label className="label">车型</label>
            <input className="input" value={form.carModel} onChange={(e) => setForm({ ...form, carModel: e.target.value })} placeholder="例如：大众朗逸" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-800 mb-4">车辆规格（下次来不用再查）</h3>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-amber-500" />
                机油型号
              </label>
              <input className="input" value={form.oilType} onChange={(e) => setForm({ ...form, oilType: e.target.value })} placeholder="例如：5W-30 全合成" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <CircleDot className="w-4 h-4 text-slate-500" />
                轮胎型号
              </label>
              <input className="input" value={form.tireType} onChange={(e) => setForm({ ...form, tireType: e.target.value })} placeholder="例如：205/55R16" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-800 mb-4">保养与保险</h3>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-500" />
                上次保养里程 (km)
              </label>
              <input type="number" className="input" value={form.lastMaintenanceMileage || ''} onChange={(e) => setForm({ ...form, lastMaintenanceMileage: Number(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <label className="label">上次保养日期</label>
              <input type="date" className="input" value={form.lastMaintenanceDate} onChange={(e) => setForm({ ...form, lastMaintenanceDate: e.target.value })} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                保险公司
              </label>
              <input className="input" value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} placeholder="例如：平安保险" />
            </div>
            <div>
              <label className="label">保险到期日期</label>
              <input type="date" className="input" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <Link to="/vehicles" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Save className="w-4 h-4" />
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
