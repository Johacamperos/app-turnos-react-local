
import React from "react";
import { colorPresets, defaultThemeColors } from "../slices/themeDefaults";
import { useTheme as useSettingsTheme } from "./SettingsContext";


// Mantenemos este contexto por compatibilidad con el código existente
export const ThemeContext = React.createContext(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usamos el nuevo sistema de configuraciones
  const { theme, updateTheme, resetTheme } = useSettingsTheme();
  
  // Funciones de compatibilidad
  const updateThemeHandler = (newTheme: any) => {    
    updateTheme(newTheme);
  };

  const resetThemeHandler = () => {
    resetTheme();
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      updateTheme: updateThemeHandler, 
      resetTheme: resetThemeHandler, 
      defaultThemeColors, 
      colorPresets 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {

  return useSettingsTheme();
};
