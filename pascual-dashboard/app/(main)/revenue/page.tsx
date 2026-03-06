"use client";

import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const stats = [
  { label: 'MONTHLY REVENUE', value: '$1,800', icon: CurrencyDollarIcon, color: 'text-cyan-400' },
  { label: 'ACTIVE CLIENTS', value: '6', icon: UserGroupIcon, color: 'text-purple-400' },
  { label: 'AGENT TASKS TODAY', value: '23', icon: ClipboardDocumentListIcon, color: 'text-cyan-400' },
  { label: 'DAYS TO GOAL', value: '137', icon: CalendarDaysIcon, color: 'text-cyan-400' },
];

const milestones = [
  { label: '5 Clients', achieved: true },
  { label: '10 Clients', achieved: false },
  { label: '25 Clients', achieved: false },
  { label: '40 Clients', achieved: false },
  { label: '$30K MRR', achieved: false },
];

const revenueSources = [
  { name: 'AI TWINBRAIN', value: '$1,800' },
  { name: 'AUTOMATION', value: '$0' },
  { name: 'YOUTUBE', value: '$0' },
];

const monthlyData = [
  { month: 'Sep', value: 450 },
  { month: 'Oct', value: 680 },
  { month: 'Nov', value: 920 },
  { month: 'Dec', value: 980 },
  { month: 'Jan', value: 1350 },
  { month: 'Feb', value: 1650 },
];

const sectorDistribution = [
  { name: 'Soporte', value: 35, color: '#00d4ff' },
  { name: 'Ventas', value: 25, color: '#8b5cf6' },
  { name: 'Marketing', value: 20, color: '#ec4899' },
  { name: 'Operaciones', value: 12, color: '#10b981' },
  { name: 'Otros', value: 8, color: '#f59e0b' },
];

export default function RevenuePage() {
  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold font-display ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Boss Battle */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">⚔️</span>
          <span className="text-red-400 text-sm font-medium uppercase tracking-wider">BOSS BATTLE</span>
        </div>
        <h2 className="text-2xl font-bold text-white font-display mb-6">The $30K/mo Beast</h2>

        {/* HP Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">BOSS HP</span>
            <span className="text-gray-400">$3,200 / $30,000 HP</span>
          </div>
          <div className="w-full h-3 bg-[#1e3a5f]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
              style={{ width: '10.7%' }}
            ></div>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex flex-wrap gap-2 mb-8">
          {milestones.map((milestone, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                milestone.achieved
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-[#1e3a5f]/30 text-gray-500'
              }`}
            >
              {milestone.label}
            </span>
          ))}
        </div>

        {/* Revenue Sources */}
        <div className="grid grid-cols-3 gap-4">
          {revenueSources.map((source, index) => (
            <div key={index} className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{source.name}</p>
              <p className="text-2xl font-bold text-white font-display">{source.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-cyan-400 font-display mb-6">Revenue Mensual</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t"
                  style={{ height: `${(data.value / maxValue) * 100}%` }}
                ></div>
                <span className="text-gray-500 text-xs">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-gray-600 text-xs">
            <span>0</span>
            <span>450</span>
            <span>900</span>
            <span>1350</span>
            <span>1800</span>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-cyan-400 font-display mb-6">Distribución por Sector</h3>
          <div className="flex items-center justify-center mb-6">
            {/* Donut Chart Placeholder */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {sectorDistribution.reduce((acc, sector, index) => {
                  const prevTotal = sectorDistribution.slice(0, index).reduce((sum, s) => sum + s.value, 0);
                  const circumference = 2 * Math.PI * 35;
                  const offset = (prevTotal / 100) * circumference;
                  const length = (sector.value / 100) * circumference;

                  acc.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={sector.color}
                      strokeWidth="12"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  return acc;
                }, [] as JSX.Element[])}
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sectorDistribution.map((sector, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
                <span className="text-gray-400 text-sm">{sector.name} {sector.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}