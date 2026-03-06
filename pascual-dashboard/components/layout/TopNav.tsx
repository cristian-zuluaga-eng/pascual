"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, WifiIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { name: 'Command Center', href: '/command-center', icon: '⚙' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Revenue', href: '/revenue', icon: '📈' },
  { name: 'Timeline', href: '/timeline', icon: '⏱' },
  { name: 'Intel', href: '/intel', icon: '🌐' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className="bg-[#0a0f1a] border-b border-[#1e3a5f]/50">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        {/* Header with logo and status */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-[#0d1421] border border-[#1e3a5f] flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full status-online"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-white font-display">AVA</h1>
              <p className="text-sm text-gray-500">Master Bot Dashboard</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1421] border border-[#1e3a5f]">
              <WifiIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">En línea</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-[#0d1421] border border-[#1e3a5f]">
              <span className="text-gray-400 text-sm">Marzo 2026</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e3a5f]/30'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-full bg-[#0d1421] border border-[#1e3a5f] text-sm text-gray-300 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}