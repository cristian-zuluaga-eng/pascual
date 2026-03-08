"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface DashboardConfig {
  // Vistas del sidebar
  views: {
    home: boolean;
    planificador: boolean;
    agents: boolean;
    development: boolean;
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
}

const defaultConfig: DashboardConfig = {
  views: {
    home: true,
    planificador: true,
    agents: true,
    development: true,
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
};

interface DashboardConfigContextType {
  config: DashboardConfig;
  updateViewConfig: (key: keyof DashboardConfig["views"], value: boolean) => void;
  updateAgentViewConfig: (key: keyof DashboardConfig["agentViews"], value: boolean) => void;
  updateHeaderConfig: (key: keyof DashboardConfig["header"], value: boolean) => void;
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
