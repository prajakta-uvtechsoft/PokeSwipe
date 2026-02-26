export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  border: string;
  like: string;
  dislike: string;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  background: '#F4F5FB',
  cardBackground: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#22C55E',
  accentSoft: '#DCFCE7',
  border: '#E5E7EB',
  like: '#22C55E',
  dislike: '#F97373',
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  background: '#020617',
  cardBackground: '#0F172A',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  accent: '#22C55E',
  accentSoft: '#064E3B',
  border: '#1F2937',
  like: '#4ADE80',
  dislike: '#FB7185',
};

