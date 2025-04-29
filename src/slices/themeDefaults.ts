
// src/slices/themeDefaults.ts
export interface ThemeConfig {
  companyName: string;
  appTitle: string;
  isDarkMode?: boolean;
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Presets de colores para la selección rápida
export const colorPresets = [
  {
    name: 'Blue',
    primary: '#2563EB',
    secondary: '#EFF6FF',
    accent: '#DBEAFE'
  },
  {
    name: 'Green',
    primary: '#10B981',
    secondary: '#ECFDF5',
    accent: '#D1FAE5'
  },
  {
    name: 'Purple',
    primary: '#8B5CF6',
    secondary: '#F1F0FB',
    accent: '#E5DEFF'
  },
  {
    name: 'Orange',
    primary: '#F97316',
    secondary: '#FEF7CD',
    accent: '#FDE1D3'
  },
  {
    name: 'Red',
    primary: '#EF4444',
    secondary: '#FEF2F2',
    accent: '#FEE2E2'
  }
];

// Colores del tema por defecto
export const defaultThemeColors = {
  primary: '#2563EB', // Azul primario
  secondary: '#EFF6FF', // Azul muy claro para fondos
  accent: '#DBEAFE', // Azul claro para acentos
};

// Tema completo por defecto
export const defaultTheme: ThemeConfig = {
  companyName: 'Turnopolis',
  appTitle: 'Queue Management System',
  isDarkMode: false,
  logoUrl: '',
  colors: defaultThemeColors
};

// Modelo completo de configuración de la aplicación
export interface AppSettings {
  theme: ThemeConfig;
  language: {
    currentLanguage: string;
    availableLanguages: Array<{
      code: string;
      name: string;
      active: boolean;
    }>;
  };
  system: {
    webhookUrl: string;
    notificationsEnabled: boolean;
    devices: Array<{
      id: string;
      name: string;
      token?: string;
      isLinked: boolean;
    }>;
    additionalConfig?: string;
  };
  account: {
    email?: string;
    displayName?: string;
    profileImageUrl?: string;
    preferences?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
  };
}

// Configuración por defecto de la aplicación
export const defaultAppSettings: AppSettings = {
  theme: defaultTheme,
  language: {
    currentLanguage: 'es',
    availableLanguages: [
      { code: 'es', name: 'Español', active: true },
      { code: 'en', name: 'English', active: true },
      { code: 'fr', name: 'Français', active: true }
    ]
  },
  system: {
    webhookUrl: '',
    notificationsEnabled: false,
    devices: [],
    additionalConfig: ''
  },
  account: {
    preferences: {
      emailNotifications: true,
      pushNotifications: false
    }
  }
};
