import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    entities: Palette['primary'];
    useCases: Palette['primary'];
    adapters: Palette['primary'];
    drivers: Palette['primary'];
  }

  interface PaletteOptions {
    entities?: PaletteOptions['primary'];
    useCases?: PaletteOptions['primary'];
    adapters?: PaletteOptions['primary'];
    drivers?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    code: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
  }
}

