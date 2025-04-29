import React from "react";
import { useSystem as useSettingsSystem } from "./SettingsContext";
import { AppSettings } from "../slices/themeDefaults";

// Mantenemos este contexto por compatibilidad con el código existente
export const SystemContext = React.createContext<any>(null);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usamos el nuevo sistema de configuraciones
  const { updateSystem, addDevice, removeDevice, updateDevice, system } = useSettingsSystem();

  // Funciones de compatibilidad
  const updateSystemHandler = (newSystem: Partial<AppSettings['system']>) => {
    updateSystem(newSystem);
  };

  return (
    <SystemContext.Provider value={{
      system,
      updateSystem: updateSystemHandler,
      addDevice,
      removeDevice,
      updateDevice
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = React.useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
