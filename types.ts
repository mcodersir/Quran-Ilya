
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  audio?: string; 
  audioSecondary?: string[];
  translation?: string;
  tafsir?: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export type UILanguageCode = 'en' | 'fa' | 'ar' | 'zh' | 'tr' | 'fr' | 'id' | 'ru';

export interface Language {
    id: UILanguageCode;
    label: string;
    flag: string;
    dir: 'ltr' | 'rtl';
    font: string;
}

export interface AppSettings {
  language: string; // Content language (for translations)
  uiLanguage: UILanguageCode; // Interface language
  translationIdentifier: string; 
  reciterIdentifier: string; 
  tafsirIdentifier: string; // New: Selected Tafseer Book
  onboardingComplete: boolean;
  theme: 'light' | 'dark';
  arabicFontSize: number; // 1-5 scale
  translationFontSize: number; // 1-5 scale
  uiFontSize: number; // 1-5 scale for App UI
  arabicFont: string; // Font class name
  translationFont: string; // Font class name
  tafsirFont?: string; // Font class for tafsir
  tafsirFontSize?: number; // 1-5 scale
  appFont?: string; // Base app font
  defaultPlaybackRate?: number;
  showDailyVerse?: boolean;
  playBismillah: boolean;
}

export interface Bookmark {
  id: string; // surah:ayah OR surah_ID
  surahNumber: number;
  ayahNumber?: number; // Optional for Surah-only bookmarks
  surahName: string;
  timestamp: number;
  note?: string;
}

export interface LastReadState {
    surah: Surah;
    ayahNumber: number;
    timestamp: number;
    juzNumber?: number; // Track if reading a specific Juz
}

export interface JuzProgress {
    juzNumber: number;
    lastSurahNumber: number;
    lastAyahNumber: number;
    timestamp: number;
    percentage: number;
}

export type ViewState = 'HOME' | 'SURAH' | 'SEARCH' | 'SETTINGS' | 'DOWNLOADS' | 'BOOKMARKS';

export interface ThemeCategory {
  id: string;
  titleKey: string;
  imageUrl: string;
  surahIds: number[];
}
