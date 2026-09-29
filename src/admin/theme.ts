export type AdminTheme = 'cyber';

export interface ThemeConfig {
  id: AdminTheme;
  name: string;
  icon: string;
  description: string;
  badge: string;
  bgHex: string;
  surfaceHex: string;
  borderHex: string;
  accentHex: string;
}

export const ADMIN_THEMES: Record<AdminTheme, ThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'ApexStore User Theme',
    icon: 'fa-bolt',
    description: 'Storefront signature neon purple & deep obsidian aesthetic',
    badge: 'Storefront Sync',
    bgHex: '#0a0a0f',
    surfaceHex: '#13131a',
    borderHex: '#3b1c71',
    accentHex: '#a855f7'
  }
};
