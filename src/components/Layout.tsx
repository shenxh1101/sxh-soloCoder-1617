import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Bell,
  BarChart3,
  PhoneCall,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/vehicles', label: '车辆管理', icon: Car },
  { to: '/records', label: '维修记录', icon: Wrench },
  { to: '/reminders', label: '提醒中心', icon: Bell },
  { to: '/statistics', label: '统计报表', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-primary-600 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-primary-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">汽修管家</div>
              <div className="text-xs text-primary-200 mt-0.5">Garage Manager</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-primary-700 shadow-md'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary-500/40">
          <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-primary-200">
            <PhoneCall className="w-4 h-4" />
            <span>客服电话：400-000-0000</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ||
                '汽修管家'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              管
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
