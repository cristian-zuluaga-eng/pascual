"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface DashboardConfig {
  // Vistas del sidebar
  views: {
    home: boolean;
    planificador: boolean;
    agents: boolean;
    chatEmergente: boolean;
  };
  // Agentes individuales
  agentViews: {
    asistente: boolean;
    nexus: boolean;
    sentinel: boolean;
    scout: boolean;
    audiovisual: boolean;
    consultor: boolean;
    gambito: boolean;
    condor360: boolean;
    picasso: boolean;
  };
  // Header
  header: {
    showNotificationBanner: boolean;
    showSystemStatus: boolean;
    showLastSync: boolean;
  };
  // Grids por pantalla
  grids: {
    home: {
      actividadReciente: boolean;
    };
    sentinel: {
      monitorAmenazas: boolean;
      recursosSistema: boolean;
      escaneoVulnerabilidades: boolean;
      mejorasImplementadas: boolean;
      mapaActividad: boolean;
    };
    nexus: {
      tareasEnCurso: boolean;
      mejorasScripts: boolean;
      codeReviews: boolean;
    };
    condor360: {
      asignacionPortafolio: boolean;
      oportunidades: boolean;
      confianzaModelo: boolean;
      noticiasFinancieras: boolean;
    };
    gambito: {
      bankroll: boolean;
      precisionDeporte: boolean;
      rendimientoModelos: boolean;
    };
    scout: {
      fuentesActivas: boolean;
      tendencias: boolean;
      busquedasRecientes: boolean;
    };
    audiovisual: {
      biblioteca: boolean;
      procesamientoActivo: boolean;
      capacidades: boolean;
    };
    consultor: {
      areasExperticia: boolean;
      resumenArea: boolean;
    };
    asistente: {
      agendaDia: boolean;
      sugerenciasProactivas: boolean;
      gestionDomestica: boolean;
    };
    picasso: {
      necesidades: boolean;
      logImplementacion: boolean;
    };
  };
  // KPIs por agente (cada KPI individual)
  kpis: {
    sentinel: {
      seguridad: boolean;
      uptime: boolean;
      amenazas: boolean;
      mttd: boolean;
      cumplimiento: boolean;
      disco: boolean;
    };
    nexus: {
      eficienciaIA: boolean;
      tests: boolean;
      docs: boolean;
      arquitectura: boolean;
      prsAbiertos: boolean;
      bugs: boolean;
    };
    condor360: {
      retorno: boolean;
      precision: boolean;
    };
    gambito: {
      roi: boolean;
      winRate: boolean;
      precision: boolean;
      sharpe: boolean;
      drawdown: boolean;
    };
    scout: {
      busquedas: boolean;
      precision: boolean;
      fuentes: boolean;
      data: boolean;
      cache: boolean;
    };
    audiovisual: {
      generados: boolean;
      enCola: boolean;
      calidad: boolean;
      storage: boolean;
    };
    consultor: {
      consultas: boolean;
      satisfaccion: boolean;
      planes: boolean;
      followUp: boolean;
      exito: boolean;
    };
    asistente: {
      tareasHoy: boolean;
      completado: boolean;
      precision: boolean;
      recordatorio: boolean;
      satisfaccion: boolean;
    };
    picasso: {
      uptime: boolean;
      uxScore: boolean;
    };
  };
}

const defaultConfig: DashboardConfig = {
  views: {
    home: true,
    planificador: true,
    agents: true,
    chatEmergente: true,
  },
  agentViews: {
    asistente: true,
    nexus: true,
    sentinel: true,
    scout: true,
    audiovisual: true,
    consultor: true,
    gambito: true,
    condor360: true,
    picasso: true,
  },
  header: {
    showNotificationBanner: true,
    showSystemStatus: true,
    showLastSync: true,
  },
  grids: {
    home: {
      actividadReciente: true,
    },
    sentinel: {
      monitorAmenazas: true,
      recursosSistema: true,
      escaneoVulnerabilidades: true,
      mejorasImplementadas: true,
      mapaActividad: true,
    },
    nexus: {
      tareasEnCurso: true,
      mejorasScripts: true,
      codeReviews: true,
    },
    condor360: {
      asignacionPortafolio: true,
      oportunidades: true,
      confianzaModelo: true,
      noticiasFinancieras: true,
    },
    gambito: {
      bankroll: true,
      precisionDeporte: true,
      rendimientoModelos: true,
    },
    scout: {
      fuentesActivas: true,
      tendencias: true,
      busquedasRecientes: true,
    },
    audiovisual: {
      biblioteca: true,
      procesamientoActivo: true,
      capacidades: true,
    },
    consultor: {
      areasExperticia: true,
      resumenArea: true,
    },
    asistente: {
      agendaDia: true,
      sugerenciasProactivas: true,
      gestionDomestica: true,
    },
    picasso: {
      necesidades: true,
      logImplementacion: true,
    },
  },
  kpis: {
    sentinel: {
      seguridad: true,
      uptime: true,
      amenazas: true,
      mttd: true,
      cumplimiento: true,
      disco: true,
    },
    nexus: {
      eficienciaIA: true,
      tests: true,
      docs: true,
      arquitectura: true,
      prsAbiertos: true,
      bugs: true,
    },
    condor360: {
      retorno: true,
      precision: true,
    },
    gambito: {
      roi: true,
      winRate: true,
      precision: true,
      sharpe: true,
      drawdown: true,
    },
    scout: {
      busquedas: true,
      precision: true,
      fuentes: true,
      data: true,
      cache: true,
    },
    audiovisual: {
      generados: true,
      enCola: true,
      calidad: true,
      storage: true,
    },
    consultor: {
      consultas: true,
      satisfaccion: true,
      planes: true,
      followUp: true,
      exito: true,
    },
    asistente: {
      tareasHoy: true,
      completado: true,
      precision: true,
      recordatorio: true,
      satisfaccion: true,
    },
    picasso: {
      uptime: true,
      uxScore: true,
    },
  },
};

interface DashboardConfigContextType {
  config: DashboardConfig;
  updateViewConfig: (key: keyof DashboardConfig["views"], value: boolean) => void;
  updateAgentViewConfig: (key: keyof DashboardConfig["agentViews"], value: boolean) => void;
  updateHeaderConfig: (key: keyof DashboardConfig["header"], value: boolean) => void;
  updateGridConfig: <T extends keyof DashboardConfig["grids"]>(
    screen: T,
    grid: keyof DashboardConfig["grids"][T],
    value: boolean
  ) => void;
  updateKpiConfig: <T extends keyof DashboardConfig["kpis"]>(
    agent: T,
    kpi: keyof DashboardConfig["kpis"][T],
    value: boolean
  ) => void;
  resetConfig: () => void;
}

const DashboardConfigContext = createContext<DashboardConfigContextType | undefined>(undefined);

export function DashboardConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);

  const updateViewConfig = (key: keyof DashboardConfig["views"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      views: { ...prev.views, [key]: value },
    }));
  };

  const updateAgentViewConfig = (key: keyof DashboardConfig["agentViews"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      agentViews: { ...prev.agentViews, [key]: value },
    }));
  };

  const updateHeaderConfig = (key: keyof DashboardConfig["header"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      header: { ...prev.header, [key]: value },
    }));
  };

  const updateGridConfig = <T extends keyof DashboardConfig["grids"]>(
    screen: T,
    grid: keyof DashboardConfig["grids"][T],
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      grids: {
        ...prev.grids,
        [screen]: {
          ...prev.grids[screen],
          [grid]: value,
        },
      },
    }));
  };

  const updateKpiConfig = <T extends keyof DashboardConfig["kpis"]>(
    agent: T,
    kpi: keyof DashboardConfig["kpis"][T],
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        [agent]: {
          ...prev.kpis[agent],
          [kpi]: value,
        },
      },
    }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <DashboardConfigContext.Provider
      value={{
        config,
        updateViewConfig,
        updateAgentViewConfig,
        updateHeaderConfig,
        updateGridConfig,
        updateKpiConfig,
        resetConfig,
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  );
}

export function useDashboardConfig() {
  const context = useContext(DashboardConfigContext);
  if (context === undefined) {
    throw new Error("useDashboardConfig must be used within a DashboardConfigProvider");
  }
  return context;
}
