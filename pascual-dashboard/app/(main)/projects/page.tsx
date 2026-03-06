"use client";

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Project {
  id: string;
  title: string;
  description: string;
  agent: string;
  priority: Priority;
  date: string;
  status: ProjectStatus;
}

const projects: Project[] = [
  { id: '1', title: 'Sistema de Alertas', description: 'Configurar alertas automáticas para métricas críticas del bot.', agent: 'sentinel', priority: 'high', date: 'Mar 1, 2026', status: 'backlog' },
  { id: '2', title: 'Integración CRM', description: 'Conectar con plataforma CRM para sync de contactos.', agent: 'nexus', priority: 'medium', date: 'Mar 5, 2026', status: 'backlog' },
  { id: '3', title: 'Dashboard Móvil', description: 'Adaptar vistas principales para dispositivos móviles.', agent: 'pixel', priority: 'low', date: 'Mar 10, 2026', status: 'backlog' },
  { id: '4', title: 'Flujo de Onboarding', description: 'Construir setup guiado para nuevos usuarios del bot.', agent: 'iris', priority: 'high', date: 'Feb 28, 2026', status: 'in_progress' },
  { id: '5', title: 'Reportes Automáticos', description: 'Generar reportes semanales de rendimiento automáticamente.', agent: 'atlas', priority: 'medium', date: 'Mar 2, 2026', status: 'in_progress' },
  { id: '6', title: 'API de Webhooks', description: 'Endpoints para notificaciones en tiempo real.', agent: 'ops', priority: 'high', date: 'Feb 25, 2026', status: 'review' },
  { id: '7', title: 'Auth Sistema', description: 'Implementar autenticación multi-factor.', agent: 'sentinel', priority: 'high', date: 'Feb 20, 2026', status: 'done' },
  { id: '8', title: 'Base de Conocimiento', description: 'Configurar KB para respuestas automatizadas.', agent: 'herald', priority: 'medium', date: 'Feb 18, 2026', status: 'done' },
];

const columns: { id: ProjectStatus; title: string; icon: string }[] = [
  { id: 'backlog', title: 'Backlog', icon: '📋' },
  { id: 'in_progress', title: 'In Progress', icon: '⏳' },
  { id: 'review', title: 'Review', icon: '👀' },
  { id: 'done', title: 'Done', icon: '✅' },
];

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'low':
      return 'bg-blue-500/20 text-blue-400';
  }
};

const getAgentColor = (agent: string) => {
  const colors: Record<string, string> = {
    sentinel: 'bg-purple-500/20 text-purple-400',
    nexus: 'bg-cyan-500/20 text-cyan-400',
    pixel: 'bg-pink-500/20 text-pink-400',
    iris: 'bg-green-500/20 text-green-400',
    atlas: 'bg-blue-500/20 text-blue-400',
    ops: 'bg-orange-500/20 text-orange-400',
    herald: 'bg-teal-500/20 text-teal-400',
  };
  return colors[agent] || 'bg-gray-500/20 text-gray-400';
};

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<string>('AI TwinBrain');

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter((p) => p.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1421] border border-[#1e3a5f]">
          <span className="text-gray-400 text-sm">{selectedProject}</span>
          <PlusIcon className="w-4 h-4 text-cyan-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          return (
            <div key={column.id} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span>{column.icon}</span>
                  <span className="text-white font-medium">{column.title}</span>
                  <span className="px-2 py-0.5 rounded bg-[#1e3a5f]/50 text-cyan-400 text-xs">
                    {columnProjects.length}
                  </span>
                </div>
                <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    className="card p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
                  >
                    <h3 className="text-white font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAgentColor(project.agent)}`}>
                        {project.agent}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{project.date}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}