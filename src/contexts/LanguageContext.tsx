
import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage as useSettingsLanguage } from './SettingsContext';

interface Language {
  code: string;
  name: string;
  active: boolean;
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (code: string) => void;
  languages: Language[];
  addLanguage: (language: Omit<Language, 'active'>) => void;
  updateLanguage: (code: string, updates: Partial<Language>) => void;
  toggleLanguageStatus: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Utilizamos el hook del contexto de configuraciones centralizado
  const languageSettings = useSettingsLanguage();

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage: languageSettings.currentLanguage, 
        changeLanguage: languageSettings.changeLanguage, 
        languages: languageSettings.languages, 
        addLanguage: languageSettings.addLanguage, 
        updateLanguage: languageSettings.updateLanguage,
        toggleLanguageStatus: languageSettings.toggleLanguageStatus
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
