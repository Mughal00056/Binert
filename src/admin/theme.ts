export type AdminTheme = 'cyber' | 'obsidian' | 'slate' | 'light';

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
    name: 'ApexStore Cyber',
    icon: 'fa-bolt',
    description: 'Storefront signature neon purple & deep obsidian aesthetic',
    badge: 'Storefront Sync',
    bgHex: '#0a0a0f',
    surfaceHex: '#13131a',
    borderHex: '#3b1c71',
    accentHex: '#a855f7'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Midnight Stealth',
    icon: 'fa-moon',
    description: 'Pitch black stealth with emerald matrix highlights',
    badge: 'Stealth Black',
    bgHex: '#030712',
    surfaceHex: '#0a101d',
    borderHex: '#1f2937',
    accentHex: '#10b981'
  },
  slate: {
    id: 'slate',
    name: 'Studio Slate',
    icon: 'fa-layer-group',
    description: 'Pro developer navy slate with sky blue accents',
    badge: 'Pro Dark',
    bgHex: '#0f172a',
    surfaceHex: '#1e293b',
    borderHex: '#334155',
    accentHex: '#38bdf8'
  },
  light: {
    id: 'light',
    name: 'Clean Enterprise',
    icon: 'fa-sun',
    description: 'Crisp bright high-contrast executive daylight theme',
    badge: 'Classic Light',
    bgHex: '#f8fafc',
    surfaceHex: '#ffffff',
    borderHex: '#e2e8f0',
    accentHex: '#4f46e5'
  }
};
