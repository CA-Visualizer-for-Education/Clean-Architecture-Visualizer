import type { CSSProperties } from "react";

export interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    textWhite: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    violation: string;
    layerEntities: string;
    layerUseCases: string;
    layerAdapters: string;
    layerDrivers: string;
    textEntities: string;
    textUseCases: string;
    textAdapters: string;
    textDrivers: string;
    componentEntities: string;
    componentUseCases: string;
    componentAdapters: string;
    componentDrivers: string;
    componentBorder: string;
  };
  typography: {
    h1: CSSProperties;
    h2: CSSProperties;
    h3: CSSProperties;
    body: CSSProperties;
    bodySmall: CSSProperties;
    code: CSSProperties;
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
  borderRadius?: {
    small: string;
    medium: string;
    large: string;
  };
}

export const defaultTheme: Theme = {
    colors: {
        primary: "#CCE0FF",
        background: "#FFFFFF",
        text: "#212121",
        textWhite: "#FFFFFF",
        textSecondary: "#616161",
        textTertiary: "#9E9E9E",
        border: "#E0E0E0",
        violation: "#D84315",
        layerEntities: "#FFFDE7",
        layerUseCases: "#FFEBEE",
        layerAdapters: "#E8F5E9",
        layerDrivers: "#E1F5FE",
        textEntities: "#966C03",
        textUseCases: "#880E4F",
        textAdapters: "#1B5E20",
        textDrivers: "#01579B",
        componentEntities: "#fbc02d",
        componentUseCases: "#EA578D",
        componentAdapters: "#45A54A",
        componentDrivers: "#0291E3",
        componentBorder: "#212121",
    },
    typography: {
        h1: {
            fontSize: "2rem",
            fontWeight: "bold",
            lineHeight: "1.2",
            marginBottom: "1rem",
        },
        h2: {
            fontSize: "1.5rem",
            fontWeight: "600",
            lineHeight: "1.3",
            marginBottom: "0.875rem",
        },
        h3: {
            fontSize: "1.25rem",
            fontWeight: "600",
            lineHeight: "1.4",
            marginBottom: "0.75rem",
        },
        body: {
            fontSize: "1rem",
            lineHeight: "1.5",
            color: "#212121",
            fontFamily: "'Inter', sans-serif",
        },
        bodySmall: {
            fontSize: "0.875rem",
            lineHeight: "1.43",
            color: "#616161",
            fontFamily: "'Inter', sans-serif",
        },
        code: {
            fontFamily: "Consolas, Monaco, \"Courier New\", monospace",
            fontSize: "0.875rem",
            backgroundColor: "#F5F5F5",
            padding: "0.125rem 0.25rem",
            borderRadius: "0.1875rem",
        },
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        xxl: "3rem",
    },
    shadows: {
        small: "0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.12), 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.24)",
        medium: "0 0.1875rem 0.375rem rgba(0, 0, 0, 0.15), 0 0.125rem 0.25rem rgba(0, 0, 0, 0.12)",
        large: "0 0.625rem 1.25rem rgba(0, 0, 0, 0.15), 0 0.1875rem 0.375rem rgba(0, 0, 0, 0.10)",
    },
    fonts: {
        body: "'Inter', sans-serif",
        heading: "'Poppins', sans-serif",
    },
    borderRadius: {
        small: "0.25rem",
        medium: "0.5rem",
        large: "0.75rem",
    },
};
