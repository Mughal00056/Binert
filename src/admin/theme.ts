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
  previewColor: string;
}

export const USER_STOREFRONT_THEME: ThemeConfig = {
  id: 'cyber',
  name: 'ApexStore User Theme',
  icon: 'fa-bolt',
  description: 'Storefront signature neon purple & deep obsidian aesthetic',
  badge: 'Storefront Theme',
  bgHex: '#0a0a0f',
  surfaceHex: '#13131a',
  borderHex: '#3b1c71',
  accentHex: '#a855f7',
  previewColor: '#9333ea'
};

export const ADMIN_THEMES: ThemeConfig[] = [USER_STOREFRONT_THEME];
