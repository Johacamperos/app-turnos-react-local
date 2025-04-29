import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import ApiService from "../api/ApiService";
import { AppSettings, colorPresets, defaultAppSettings } from "../slices/themeDefaults";
import { useToast } from "@/components/ui/use-toast";
import i18n from "../i18n";


type SettingsContextType = {
  settings: AppSettings;
  isLoading: boolean;
  hasChanges: boolean;
  updateTheme: (newTheme: Partial<AppSettings['theme']>) => Promise<void>;
  updateLanguage: (newLanguage: Partial<AppSettings['language']>) => Promise<void>;
  updateSystem: (newSystem: Partial<AppSettings['system']>) => Promise<void>;
  updateAccount: (newAccount: Partial<AppSettings['account']>) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  saveChanges: (newTheme: AppSettings) => Promise<void>;
  discardChanges: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [originalSettings, setOriginalSettings] = useState<AppSettings>(defaultAppSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Aplicar cambios inmediatos en la UI sin necesidad de guardar en el servidor
  const applyUIChanges = useCallback(() => {
    // Aplicar los colores del tema
    document.documentElement.style.setProperty("--custom-primary", settings.theme.colors.primary);
    document.documentElement.style.setProperty("--custom-secondary", settings.theme.colors.secondary);
    document.documentElement.style.setProperty("--custom-accent", settings.theme.colors.accent);
    
    // Aplicar el modo oscuro/claro
    if (settings.theme.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Aplicar el idioma
    i18n.changeLanguage(settings.language.currentLanguage);
  }, [settings]);

  // Función de debounce para guardar cambios
  const debouncedSave = useCallback((changes: Partial<AppSettings>) => {
    // Cancelar el timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Programar una nueva operación de guardado
    /*saveTimeoutRef.current = setTimeout(() => {
      console.log("Debounced save triggered:", changes);
      saveChanges();
    }, 2000); // 2 segundos de debounce
    */
  }, []);

  // Cargar configuraciones al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await ApiService.fetchSettings();
       
       setSettings(loadedSettings);
        //setOriginalSettings(loadedSettings);
        
        // Aplicar configuraciones iniciales
        document.documentElement.style.setProperty("--custom-primary", loadedSettings.theme.colors.primary);
        document.documentElement.style.setProperty("--custom-secondary", loadedSettings.theme.colors.secondary);
        document.documentElement.style.setProperty("--custom-accent", loadedSettings.theme.colors.accent);
        
        if (loadedSettings.theme.isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        
        i18n.changeLanguage(loadedSettings.language.currentLanguage);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las configuraciones, usando valores por defecto",
          variant: "destructive",
        });
        
        // En caso de error, usar las configuraciones predeterminadas
        setSettings(defaultAppSettings);
        setOriginalSettings(defaultAppSettings);
        applyUIChanges();
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Guardar cambios en el servidor
  const saveChanges = async (settings: AppSettings): Promise<void> => {
    try {
           
      console.log("Saving settings to server:", settings);
      await ApiService.updateSettings(settings);
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios en el servidor, pero se mantienen localmente",
        variant: "destructive",
      });
    }
    
    // Limpiar cualquier timeout pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  // Descartar cambios no guardados
  const discardChanges = () => {
    setSettings(originalSettings);
    applyUIChanges();
    setHasChanges(false);
    
    toast({
      title: "Cambios descartados",
      description: "Se han descartado los cambios no guardados",
    });
    
    // Limpiar cualquier timeout pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const updateTheme = async (newTheme: Partial<AppSettings["theme"]>): Promise<void> => {
    let updatedSettings: AppSettings;
  
    // Actualiza el estado de configuración
    setSettings(prev => {
      updatedSettings = {
        ...prev,
        theme: {
          ...prev.theme,
          ...newTheme,
          colors: {
            ...prev.theme.colors,
            ...(newTheme.colors || {}),
          }
        }
      };
  
      // Aplicar los cambios de UI inmediatamente
      if (newTheme.colors) {
        if (newTheme.colors.primary) {
          document.documentElement.style.setProperty("--custom-primary", newTheme.colors.primary);
        }
        if (newTheme.colors.secondary) {
          document.documentElement.style.setProperty("--custom-secondary", newTheme.colors.secondary);
        }
        if (newTheme.colors.accent) {
          document.documentElement.style.setProperty("--custom-accent", newTheme.colors.accent);
        }
      }
  
      if (newTheme.isDarkMode !== undefined) {
        if (newTheme.isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
  
      return updatedSettings;
    });
  
    // Siempre guardar los cambios en el API
    try {
      await saveChanges(updatedSettings);
    } catch (error) {
      console.error("Error updating theme settings:", error);
    }
  };
  

  const updateLanguage = async (newLanguage: Partial<AppSettings["language"]>): Promise<void> => {
    let updatedSettings: AppSettings;
  
    setSettings(prev => {
      updatedSettings = {
        ...prev,
        language: {
          ...prev.language,
          ...newLanguage,
          availableLanguages: newLanguage.availableLanguages || prev.language.availableLanguages
        }
      };
  
      // Cambiar el idioma de la aplicación inmediatamente
      if (newLanguage.currentLanguage) {
        i18n.changeLanguage(newLanguage.currentLanguage);
      }
  
      return updatedSettings;
    });
  
    // Siempre guardar los cambios en el API
    try {
      await saveChanges(updatedSettings);
    } catch (error) {
      console.error("Error updating language settings:", error);
    }
  };
  
  const updateSystem = async (newSystem: Partial<AppSettings["system"]>): Promise<void> => {
    let updatedSettings: AppSettings;
  
    setSettings(prev => {
      updatedSettings = {
        ...prev,
        system: {
          ...prev.system,
          ...newSystem,
          devices: newSystem.devices || prev.system.devices
        }
      };
  
      return updatedSettings;
    });
  
    // Siempre guardar los cambios en el API
    try {
      await saveChanges(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
    }
  };
  
  const updateAccount = async (newAccount: Partial<AppSettings["account"]>): Promise<void> => {
    let updatedSettings: AppSettings;
  
    setSettings(prev => {
      updatedSettings = {
        ...prev,
        account: {
          ...prev.account,
          ...newAccount,
          preferences: {
            ...prev.account.preferences,
            ...(newAccount.preferences || {})
          }
        }
      };
  
      return updatedSettings;
    });
  
    // Siempre guardar los cambios en el API
    try {
      await saveChanges(updatedSettings);
    } catch (error) {
      console.error("Error updating account settings:", error);
    }
  };

  // Actualizar múltiples secciones sin llamadas innecesarias al API
  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    let updatedSettings: AppSettings;
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        ...newSettings,
        // Manejar anidaciones específicas
        theme: newSettings.theme ? {
          ...prev.theme,
          ...newSettings.theme,
          colors: {
            ...prev.theme.colors,
            ...(newSettings.theme.colors || {})
          }
        } : prev.theme,
        language: newSettings.language ? {
          ...prev.language,
          ...newSettings.language,
          availableLanguages: newSettings.language.availableLanguages || prev.language.availableLanguages
        } : prev.language,
        system: newSettings.system ? {
          ...prev.system,
          ...newSettings.system,
          devices: newSettings.system.devices || prev.system.devices
        } : prev.system,
        account: newSettings.account ? {
          ...prev.account,
          ...newSettings.account,
          preferences: {
            ...prev.account.preferences,
            ...(newSettings.account.preferences || {})
          }
        } : prev.account
      };

      
      
      // Aplicar configuraciones inmediatas
      applyUIChanges();
      
      return updatedSettings;
    });
    
    // Siempre guardar los cambios en el API
    try {
      await saveChanges(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
    }
    
  };

  // Restablecer configuraciones
  const resetSettings = async (): Promise<void> => {
    setSettings(defaultAppSettings);
    
    // Aplicar configuraciones inmediatas
    document.documentElement.style.setProperty("--custom-primary", defaultAppSettings.theme.colors.primary);
    document.documentElement.style.setProperty("--custom-secondary", defaultAppSettings.theme.colors.secondary);
    document.documentElement.style.setProperty("--custom-accent", defaultAppSettings.theme.colors.accent);
    
    if (defaultAppSettings.theme.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    i18n.changeLanguage(defaultAppSettings.language.currentLanguage);
    
    toast({
      title: "Configuración restablecida",
      description: "Se ha vuelto a la configuración por defecto",
    });
    
    // Verificar cambios para guardar en el servidor si es necesario
    await saveChanges(defaultAppSettings);
  };

  // Efecto para comprobar cambios cuando cambia el estado
  useEffect(() => {

  }, [settings]);

  return (
    <SettingsContext.Provider value={{
      settings,
      isLoading,
      hasChanges,
      updateTheme,
      updateLanguage,
      updateSystem,
      updateAccount,
      updateSettings,
      resetSettings,
      saveChanges,
      discardChanges
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Exportar hooks específicos para facilitar el uso
export const useTheme = () => {
  const { settings, updateTheme, resetSettings } = useSettings();
  return {
    theme: settings.theme,
    updateTheme ,
    resetTheme: () => resetSettings(),
    defaultThemeColors: settings.theme.colors,
    colorPresets: colorPresets,  // mantener compatibilidad
  };
};

export const useLanguage = () => {
  const { settings, updateLanguage } = useSettings();
  
  return {
    currentLanguage: settings.language.currentLanguage,
    languages: settings.language.availableLanguages,
    changeLanguage: async (code: string) => {
      await updateLanguage({ currentLanguage: code });
    },
    addLanguage: async (language: { code: string, name: string }) => {
      const newLanguages = [...settings.language.availableLanguages, { ...language, active: true }];
      await updateLanguage({ availableLanguages: newLanguages });
    },
    updateLanguage: async (code: string, updates: { name: string }) => {
      const newLanguages = settings.language.availableLanguages.map(lang => 
        lang.code === code ? { ...lang, ...updates } : lang
      );
      await updateLanguage({ availableLanguages: newLanguages });
    },
    toggleLanguageStatus: async (code: string) => {
      const newLanguages = settings.language.availableLanguages.map(lang => 
        lang.code === code ? { ...lang, active: !lang.active } : lang
      );
      await updateLanguage({ availableLanguages: newLanguages });
    }
  };
};

export const useSystem = () => {
  const { settings, updateSystem } = useSettings();
  

  return {
    system: settings.system,
    updateSystem: async (updates: Partial<AppSettings['system']>) => {
      await updateSystem(updates);
    },
    addDevice: async (device: { id: string, name: string, token?: string }) => {
      const newDevices = [...settings.system.devices, { ...device, isLinked: true }];
      await updateSystem({ devices: newDevices });
    },
    removeDevice: async (id: string) => {
      const newDevices = settings.system.devices.filter(device => device.id !== id);
      await updateSystem({ devices: newDevices });
    },
    updateDevice: async (id: string, updates: Partial<{ name: string, token: string, isLinked: boolean }>) => {
      const newDevices = settings.system.devices.map(device =>
        device.id === id ? { ...device, ...updates } : device
      );
      await updateSystem({ devices: newDevices });
    }
  };
};

export const useAccount = () => {
  const { settings, updateAccount } = useSettings();
  
  return {
    account: settings.account,
    updateAccount: async (updates: Partial<AppSettings['account']>) => {
      await updateAccount(updates);
    },
    updatePreferences: async (preferences: Partial<typeof settings.account.preferences>) => {
      await updateAccount({ 
        preferences: { 
          ...settings.account.preferences, 
          ...preferences 
        } 
      });
    }
  };
};