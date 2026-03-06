"use client";

import { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface IntelReport {
  id: string;
  date: string;
  title: string;
  source: string;
  summary: string;
  expanded?: boolean;
}

const intelReports: IntelReport[] = [
  {
    id: '1',
    date: 'March 5, 2026',
    title: 'Ayer',
    source: 'AI Intel Report - March 4, 2026',
    summary: 'Los agentes de IA han provocado una reestructuración masiva en acciones tecnológicas SaaS. ~$2 billones en capitalización bursátil borrados en 30 días. El ETF iShares Software (IGV) baja un 22% YTD.',
  },
  {
    id: '2',
    date: 'March 3, 2026',
    title: 'March 3, 2026',
    source: 'AI Intel Report - March 3, 2026',
    summary: "Anthropic lanza 'Claude Cowork' (agentes autónomos de procesos de negocio) y OpenAI revela su 'Project Operat...'",
  },
  {
    id: '3',
    date: 'March 1, 2026',
    title: 'March 1, 2026',
    source: 'Market Analysis - March 1, 2026',
    summary: 'El mercado de agentes de IA alcanza $50B en valuación combinada. Nuevas startups reciben rondas récord de financiamiento Serie A.',
  },
  {
    id: '4',
    date: 'Feb 28, 2026',
    title: 'Feb 28, 2026',
    source: 'Weekly Digest - Feb 28, 2026',
    summary: 'Las empresas Fortune 500 reportan incrementos del 40% en productividad tras implementar agentes de IA para automatización de procesos internos.',
  },
];

export default function IntelPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Last Updated */}
      <p className="text-gray-600 text-sm">Last updated: March 5, 2026, 7:18:51 PM</p>

      {/* Intel Reports */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {intelReports.map((report) => (
          <div
            key={report.id}
            className="card p-6 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <GlobeAltIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyan-400 font-display">{report.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{report.source}</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4 pl-9">
              {report.summary}
            </p>

            <button
              onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              className="flex items-center gap-1 text-cyan-400 text-sm hover:text-cyan-300 transition-colors pl-9"
            >
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedId === report.id ? 'rotate-180' : ''}`} />
              <span>Click to expand</span>
            </button>

            {expandedId === report.id && (
              <div className="mt-4 pt-4 border-t border-[#1e3a5f]/50 pl-9">
                <p className="text-gray-400 text-sm">
                  Contenido expandido del reporte. Aquí se mostraría información adicional,
                  análisis detallado, gráficos y datos relevantes sobre el tema del reporte.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}