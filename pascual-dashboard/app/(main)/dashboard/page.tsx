"use client";

import { useState } from 'react';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  XCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// Mock data
const stats = [
  { label: 'Usuarios Activos', value: '14.3K', change: '+12%', icon: UserGroupIcon },
  { label: 'Tareas Completadas', value: '2,847', change: '+8%', icon: CheckCircleIcon },
  { label: 'Conversaciones', value: '423', change: '+23%', icon: ChatBubbleLeftRightIcon },
  { label: 'Eficiencia', value: '91%', change: '+5%', icon: ArrowTrendingUpIcon },
];

const agentTasks = [
  { id: 1, task: 'Análisis de sentimiento en redes', agent: 'Agente Alpha', time: 'Hace 5 min', status: 'completed' },
  { id: 2, task: 'Generación de reporte semanal', agent: 'Agente Beta', time: 'Hace 12 min', status: 'completed' },
  { id: 3, task: 'Clasificación de tickets de soporte', agent: 'Agente Gamma', time: 'Hace 18 min', status: 'completed' },
  { id: 4, task: 'Actualización de base de conocimiento', agent: 'Agente Delta', time: 'En curso', status: 'in_progress' },
  { id: 5, task: 'Procesamiento de datos de ventas', agent: 'Agente Alpha', time: 'Hace 32 min', status: 'completed' },
];

const conversations = [
  { id: 1, name: 'Carlos M.', message: '¿Puedes generar el reporte de ventas Q1?', time: 'Ahora', online: true },
  { id: 2, name: 'Ana P.', message: 'Necesito actualizar los datos del dashboard', time: 'Hace 3 min', online: true },
  { id: 3, name: 'Luis R.', message: 'Gracias, todo funciona correctamente', time: 'Hace 15 min', online: false },
  { id: 4, name: 'María G.', message: '¿Cómo configuro las alertas automáticas?', time: 'Hace 22 min', online: true },
];

export default function DashboardPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card p-6 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <stat.icon className="w-6 h-6 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white font-display">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cyan-400 font-display">Tareas de Agentes</h2>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
              5 completadas
            </span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {agentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-[#0a0f1a]/50 border border-[#1e3a5f]/50 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{task.task}</p>
                  <p className="text-gray-500 text-sm">{task.agent}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.status === 'completed' ? (
                    <CheckCircleSolid className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ClockIcon className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className="text-gray-500 text-sm whitespace-nowrap">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cyan-400 font-display">Conversaciones</h2>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
              3 activas
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0f1a]/50 border border-[#1e3a5f]/50 hover:border-cyan-500/30 transition-colors cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-cyan-400 font-bold">
                    {conv.name.charAt(0)}
                  </div>
                  {conv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full status-online border-2 border-[#0d1421]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{conv.name}</p>
                    {conv.online && <div className="w-2 h-2 rounded-full bg-green-400"></div>}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{conv.message}</p>
                </div>
                <span className="text-gray-600 text-xs whitespace-nowrap">{conv.time}</span>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="mt-4 pt-4 border-t border-[#1e3a5f]/50">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enviar mensaje al bot maestro..."
                className="flex-1 px-4 py-3 rounded-lg bg-[#0a0f1a] border border-[#1e3a5f] text-gray-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <button className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-cyan-400 font-display mb-6">Rendimiento Semanal</h2>
        <div className="h-48 flex items-end justify-between gap-4 px-4">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => {
            const heights = [60, 80, 45, 90, 70, 40, 85];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500/50 to-cyan-400/80 rounded-t-sm"
                  style={{ height: `${heights[i]}%` }}
                ></div>
                <span className="text-gray-500 text-xs">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}