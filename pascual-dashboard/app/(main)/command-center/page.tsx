"use client";

import { useState } from 'react';
import { PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const agents = [
  { id: 'atlas', name: 'atlas', role: 'Chief Coder', model: 'Claude Opus 4.5', status: 'ready' },
  { id: 'iris', name: 'iris', role: 'Creative Director', model: 'Claude Sonnet 4.5', status: 'ready' },
  { id: 'nexus', name: 'nexus', role: 'Product Manager', model: 'Claude Sonnet 4.5', status: 'ready' },
  { id: 'herald', name: 'herald', role: 'Marketing', model: 'Claude Sonnet 4.5', status: 'ready' },
  { id: 'ops', name: 'ops', role: 'DevOps / SysAdmin', model: 'Claude Sonnet 4.5', status: 'busy' },
  { id: 'pixel', name: 'pixel', role: 'Image Artist', model: 'Claude Sonnet 4.5', status: 'ready' },
  { id: 'sentinel', name: 'sentinel', role: 'QA Director', model: 'Claude Opus 4.5', status: 'ready' },
  { id: 'scout', name: 'scout', role: 'Researcher', model: 'Gemini 2.5 Pro', status: 'ready' },
];

export default function CommandCenterPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ready':
        return 'status-online';
      case 'busy':
        return 'status-busy';
      default:
        return 'status-offline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'READY';
      case 'busy':
        return 'BUSY';
      default:
        return 'OFFLINE';
    }
  };

  return (
    <div className="space-y-8">
      {/* Operator Card */}
      <div className="flex justify-center">
        <div className="card p-8 text-center w-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl">
              👑
            </div>
            <h2 className="text-2xl font-bold text-white font-display mb-1">Operator</h2>
            <p className="text-gray-500 text-sm mb-3">CEO / Founder</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full status-online"></div>
              <span className="text-green-400 text-sm font-medium">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="card p-5 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">{agent.name}</h3>
                <p className="text-gray-500 text-sm">{agent.role}</p>
              </div>
            </div>

            {/* Model Selector */}
            <div className="relative mb-4">
              <select className="w-full px-3 py-2 rounded-lg bg-[#0a0f1a] border border-[#1e3a5f] text-gray-400 text-sm appearance-none cursor-pointer focus:border-cyan-500 focus:outline-none">
                <option>{agent.model}</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${getStatusClass(agent.status)}`}></div>
              <span className={`text-sm font-medium ${agent.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                {getStatusText(agent.status)}
              </span>
            </div>

            {/* Send Task Button */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
              <PaperAirplaneIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Send Task</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}