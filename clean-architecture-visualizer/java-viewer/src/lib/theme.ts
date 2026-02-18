export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    // CA Diagram specific colors
    layerEntities: string;
    layerUseCases: string;
    layerAdapters: string;
    layerDrivers: string;
    componentEntities: string;
    componentUseCases: string;
    componentAdapters: string;
    componentDrivers: string;
  };
  typography: {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    body: React.CSSProperties;
    bodySmall: React.CSSProperties;
    code: React.CSSProperties;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#007ACC',
    secondary: '#6C63FF',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#616161',
    textTertiary: '#9E9E9E',
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    info: '#1976D2',
    // CA Diagram colors
    layerEntities: '#FFFDE7',
    layerUseCases: '#FFEBEE',
    layerAdapters: '#E8F5E9',
    layerDrivers: '#E1F5FE',
    componentEntities: '#fbc02d',
    componentUseCases: '#D81B60',
    componentAdapters: '#38853C',
    componentDrivers: '#0277BD',
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: '1.2',
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.3',
      marginBottom: '0.875rem',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      marginBottom: '0.75rem',
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.5',
      color: '#212121',
      fontFamily: "'Inter', sans-serif",
    },
    bodySmall: {
      fontSize: '0.875rem',
      lineHeight: '1.43',
      color: '#616161',
      fontFamily: "'Inter', sans-serif",
    },
    code: {
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '0.875rem',
      backgroundColor: '#F5F5F5',
      padding: '0.2rem 0.4rem',
      borderRadius: '3px',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Poppins', sans-serif",
  },
};