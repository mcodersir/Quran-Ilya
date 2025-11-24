
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Search, Settings, 
  BookOpen, Mic, Download, Share2, Info, ChevronRight, 
  ArrowLeft, Volume2, Sparkles, X, Moon, Sun, Bookmark, 
  Edit3, FolderHeart, Globe, Check, Type, Music, Filter, CheckCircle, Home, Menu, Plus, Minus, Layers, Clock, Gauge,
  Github, Twitter, Send, User, Code, LayoutTemplate, Database, RefreshCw, Trash2, AlertTriangle, Square, CheckSquare,
  Headphones, ChevronDown, Wifi, List, Grid, StopCircle, XSquare, Book, Compass, Star
} from 'lucide-react';
import { AppSettings, Surah, SurahDetail, Ayah, Edition, ViewState, Bookmark as BookmarkType, ThemeCategory, UILanguageCode, Language, LastReadState, JuzProgress } from './types';
import * as API from './services/api';

// --- Configuration ---

const LANGUAGES: Language[] = [
    { id: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr', font: 'font-sans' },
    { id: 'fa', label: 'فارسی', flag: '🇮🇷', dir: 'rtl', font: 'font-persian' },
    { id: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl', font: 'font-arabic' },
    { id: 'zh', label: '中文', flag: '🇨🇳', dir: 'ltr', font: 'font-sans' },
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr', font: 'font-sans' },
    { id: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr', font: 'font-sans' },
    { id: 'id', label: 'Indonesia', flag: '🇮🇩', dir: 'ltr', font: 'font-sans' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr', font: 'font-sans' }
];

const FONTS_ARABIC = [
    { id: 'font-arabic', label: 'Amiri (Classic)' },
    { id: 'font-naskh', label: 'Naskh (Clear)' },
    { id: 'font-scheherazade', label: 'Scheherazade (Book Style)' },
    { id: 'font-lateef', label: 'Lateef (Calligraphic)' },
    { id: 'font-cairo', label: 'Cairo (Modern Sans)' },
    { id: 'font-arabic-sans', label: 'Noto Sans Arabic (Modern)' },
];

const FONTS_TRANS = [
    { id: 'font-persian', label: 'Vazirmatn (Persian)' },
    { id: 'font-translation-modern', label: 'Noto Sans (Modern)' },
    { id: 'font-sans', label: 'Inter (Latin UI)' },
    { id: 'font-arabic-sans', label: 'Noto Sans Arabic (BiDi)' },
    { id: 'font-scheherazade', label: 'Scheherazade (Classical)' },
];

const APP_FONTS = [
    { id: 'font-sans', label: 'Inter (Default)' },
    { id: 'font-persian', label: 'Vazirmatn' },
    { id: 'font-translation-modern', label: 'Noto Sans' },
    { id: 'font-arabic', label: 'Amiri' },
    { id: 'font-cairo', label: 'Cairo' }
];

const POPULAR_TOPICS: Record<string, string[]> = {
    en: ['Patience', 'Prayer', 'Charity', 'Parents', 'Jihad', 'Paradise', 'Mercy', 'Justice'],
    fa: ['صبر', 'نماز', 'انفاق', 'والدین', 'جهاد', 'بهشت', 'رحمت', 'عدالت'],
    ar: ['الصبر', 'الصلاة', 'الصدقة', 'الوالدين', 'الجهاد', 'الجنة', 'الرحمة', 'العدل'],
    zh: ['耐心', '祈祷', '慈善', '父母', '圣战', '天堂', '怜悯', '正义'],
    tr: ['Sabır', 'Namaz', 'Sadaka', 'Ebeveyn', 'Cihad', 'Cennet', 'Rahmet', 'Adalet'],
    fr: ['Patience', 'Prière', 'Charité', 'Parents', 'Jihad', 'Paradis', 'Miséricorde', 'Justice'],
    id: ['Kesabaran', 'Doa', 'Amal', 'Orang Tua', 'Jihad', 'Surga', 'Rahmat', 'Keadilan'],
    ru: ['Терпение', 'Молитва', 'Благотворительность', 'Родители', 'Джихад', 'Рай', 'Милосердие', 'Справедливость']
};

const PACKAGE_NAME = 'ir.app.quran.ilya.ai';
const MYKET_COMMENT_URL = `myket://comment?id=${PACKAGE_NAME}`;
const MYKET_COMMENT_WEB = `https://myket.ir/app/${PACKAGE_NAME}`;

const RECOMMENDED_RECITER_IDS = [
  'ar.alafasy',
  'ar.abdulbasitmurattal',
  'ar.husary',
  'ar.hudhaify',
  'ar.shaatree',
  'ar.maher',
  'ar.sudais',
  'ar.shuraim',
  'ar.menshawi',
  'ar.misharyrashid',
  'ar.qariah',
  'ar.fares',
  'ar.hanirifai',
  'ar.mahmood',
  'ar.abdullahbasfar',
  'ar.yasser',
  'ar.salamah',
  'ar.ibrahim',
  'ar.ayman',
  'ar.abdurrahman',
  'ar.mohammedayyoub',
  'ar.saadalkhalaf',
  'ar.hasansaleh',
  'ar.khalil',
  'ar.ghamadi',
  'ar.afsos',
  'ar.tablawi',
  'ar.minshawi'
];

// Mapping helper for Juz start
const JUZ_MAPPING: Record<number, number> = {
    1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 11, 13: 12, 14: 15, 15: 17, 16: 18, 17: 21, 18: 23, 19: 25, 20: 27,
    21: 29, 22: 33, 23: 36, 24: 39, 25: 41, 26: 46, 27: 51, 28: 58, 29: 67, 30: 78
};

const UI_TEXT: Record<string, any> = {
  en: {
    welcome: "Welcome to Quran Ilya",
    subtitle: "Intelligent Quran Experience",
    start: "Start Journey",
    continue: "Continue",
    selectLang: "Interface Language",
    selectTrans: "Select Translator",
    selectReciter: "Select Reciter",
    home: "Home",
    settings: "Settings",
    search: "Search",
    dailyVerse: "Daily Verse",
    themes: "Themes",
    surahs: "Surahs",
    downloads: "Downloads",
    bookmarks: "Bookmarks",
    playing: "Now Playing",
    auto: "Auto",
    scroll: "Scroll",
    downloaded: "Downloaded",
    download: "Download",
    notePlaceholder: "Add a personal note...",
    save: "Save",
    cancel: "Cancel",
    readMore: "Read More",
    searchPlaceholder: "Search Quran...",
    transSearch: "Search translators...",
    reciterSearch: "Search reciters...",
    searchTranslation: "Translation",
    searchArabic: "Arabic Text",
    searchTafsir: "Tafsir Text",
    searchSurahName: "Surah Name",
    searchAyah: "Ayah",
    searchJuz: "Juz",
    revelationFilter: "Meccan / Medinan",
    noMatches: "No matches found.",
    resetFilters: "Reset Filters",
    preview: "Preview",
    tafsirFontLabel: "Tafsir Font",
    showDailyVerse: "Show Daily Verse",
    offlineMode: "Offline Mode",
    themeProphets: "Stories of Prophets",
    themeGuidance: "Guidance for Life",
    themeGod: "Comprehension of God",
    themeLaw: "Laws & Jurisprudence",
    themePatience: "Patience & Hope",
    themeAfterlife: "The Afterlife",
    themeNature: "Nature & Creation",
    themeEthics: "Ethics & Morality",
    themeWomen: "Women in Quran",
    themeScience: "Science & Reason",
    themeDua: "Supplications (Dua)",
    themeFamily: "Family & Relations",
    appearance: "Appearance",
    audioSettings: "Audio Settings",
    arabicSize: "Arabic Font Size",
    transSize: "Translation Font Size",
    appFontSize: "App UI Scale",
    appFont: "App Font",
    defaultSpeed: "Default Speed",
    arabicFont: "Arabic Font",
    transFont: "Translation Font",
    playBismillah: "Play Bismillah at start",
    reset: "Reset Settings",
    all: "All Surahs",
    meccan: "Meccan",
    medinan: "Medinan",
    close: "Close",
    intro: "Intro",
    filterBy: "Filter by",
    surahOnly: "Surah Name",
    verseText: "Verse Text",
    aiInsight: "AI Insight",
    explainVerse: "Explain Verse",
    loadingAi: "Consulting AI...",
    nextSurah: "Next Surah",
    matchesFound: "Matches Found",
    noDownloads: "No downloads yet.",
    noBookmarks: "No bookmarks yet.",
    downloadedAt: "Downloaded",
    continueReading: "Continue Reading",
    lastRead: "Last Read",
    speed: "Speed",
    juz: "Juz",
    aboutDev: "About Developer",
    devName: "Seyed Mohammad Hossein Toliyat",
    downloadManager: "Offline Manager",
    downloadAll: "Download Whole Quran",
    updateData: "Update Data",
    deleteData: "Delete All Data",
    downloading: "Downloading...",
    updateAvailable: "Update Available",
    uptodate: "Up to Date",
    storageUsed: "Storage Used",
    confirmDelete: "Are you sure you want to delete all offline data?",
    dataMismatch: "Your settings (Translation/Reciter/Tafsir) do not match your downloaded data.",
    syncData: "Sync / Update Data",
    selectSurahs: "Select Surahs",
    downloadSelected: "Download Selected",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    manageDownloads: "Manage Downloads",
    downloadComplete: "Download Complete",
    downloadCompleteBody: "The selected Surahs have been saved for offline use.",
    errorLoading: "Failed to load content",
    retry: "Retry",
    includeAudio: "Include Audio",
    audioSizeWarning: "Downloading audio requires significant storage (~600MB for full Quran).",
    reciterModeRecommended: "Recommended",
    reciterModeAll: "All",
    includeTafsir: "Include Tafsir",
    tafsirSizeWarning: "Downloading tafsir adds extra text (~10-20MB for full Quran).",
    setup: "First Time Setup",
    finish: "Finish Setup",
    downloadText: "Text Only",
    downloadAudio: "Text + Audio",
    downloadTextTafsir: "Text + Tafsir",
    downloadFull: "Text + Tafsir + Audio",
    listenPreview: "Listen Preview",
    viewMode: "Browse By",
    viewSurah: "Surah",
    viewJuz: "Juz (Part)",
    continueJuz: "Continue Juz",
    downloadAudioOnly: "Download Audio",
    stop: "Stop",
    cancelled: "Cancelled",
    tafsir: "Tafseer (Exegesis)",
    selectTafsir: "Select Tafseer Book",
    loadingTafsir: "Loading Tafseer...",
    readTafsir: "Read Tafseer",
    popularTopics: "Popular Topics",
    rateApp: "Rate & Review",
    rateAppDesc: "If you enjoy Quran Ilya, please rate us on Myket and share your experience.",
    rateCta: "Rate on Myket",
    ratePromptTitle: "Enjoying the app?",
    ratePromptBody: "If you're satisfied, we'll open the Myket rating page so you can leave a score and review.",
    rateConfirm: "Open Myket",
    rateLater: "Maybe later",
    devCredit: "Developed by: Dicode",
    offlineReady: "Offline pack ready. You can read downloaded Surahs without internet.",
    offlineMissing: "No offline data found. Connect to the internet and download Surahs to use the app offline.",
    goToDownloads: "Open Downloads"
  },
  fa: {
    welcome: "به قرآن ایلیا خوش آمدید",
    subtitle: "تجربه قرآن هوشمند",
    start: "شروع سفر",
    continue: "ادامه",
    selectLang: "زبان برنامه",
    selectTrans: "انتخاب مترجم",
    selectReciter: "انتخاب قاری",
    home: "خانه",
    settings: "تنظیمات",
    search: "جستجو",
    dailyVerse: "آیه روز",
    themes: "موضوعات",
    surahs: "سوره‌ها",
    downloads: "دانلودها",
    bookmarks: "نشان‌ شده‌ها",
    playing: "در حال پخش",
    auto: "خودکار",
    scroll: "اسکرول",
    downloaded: "دانلود شده",
    download: "دانلود",
    notePlaceholder: "یادداشت شخصی...",
    save: "ذخیره",
    cancel: "لغو",
    readMore: "بیشتر بخوانید",
    searchPlaceholder: "جستجوی قرآن...",
    transSearch: "جستجوی مترجم...",
    reciterSearch: "جستجوی قاری...",
    searchTranslation: "متن ترجمه",
    searchArabic: "متن عربی",
    searchTafsir: "متن تفسیر",
    searchSurahName: "نام سوره",
    searchAyah: "آیه",
    searchJuz: "جزء",
    revelationFilter: "مکی / مدنی",
    noMatches: "نتیجه‌ای یافت نشد.",
    resetFilters: "بازنشانی فیلترها",
    preview: "پیش‌نمایش زنده",
    tafsirFontLabel: "فونت تفسیر",
    showDailyVerse: "نمایش آیه روز",
    offlineMode: "حالت آفلاین",
    themeProphets: "داستان پیامبران",
    themeGuidance: "راهنمای زندگی",
    themeGod: "شناخت خداوند",
    themeLaw: "احکام و قوانین",
    themePatience: "صبر و امید",
    themeAfterlife: "جهان آخرت",
    themeNature: "طبیعت و آفرینش",
    themeEthics: "اخلاق و معرفت",
    themeWomen: "زنان در قرآن",
    themeScience: "علم و عقلانیت",
    themeDua: "دعا و نیایش",
    themeFamily: "خانواده و روابط",
    appearance: "ظاهر",
    audioSettings: "تنظیمات صوتی",
    arabicSize: "اندازه قلم عربی",
    transSize: "اندازه قلم ترجمه",
    appFontSize: "اندازه محیط برنامه",
    appFont: "فونت برنامه",
    defaultSpeed: "سرعت پیش‌فرض پخش",
    arabicFont: "فونت عربی",
    transFont: "فونت ترجمه",
    playBismillah: "پخش بسم‌الله در ابتدا",
    reset: "بازنشانی تنظیمات",
    all: "همه سوره‌ها",
    meccan: "مکی",
    medinan: "مدنی",
    close: "بستن",
    intro: "مقدمه",
    filterBy: "فیلتر بر اساس",
    surahOnly: "نام سوره",
    verseText: "متن آیه",
    aiInsight: "تفسیر هوشمند",
    explainVerse: "تفسیر آیه",
    loadingAi: "در حال دریافت پاسخ...",
    nextSurah: "سوره بعدی",
    matchesFound: "نتیجه یافت شد",
    noDownloads: "هنوز دانلود نکرده‌اید.",
    noBookmarks: "هنوز نشانی ذخیره نکرده‌اید.",
    downloadedAt: "تاریخ دانلود",
    continueReading: "ادامه مطالعه",
    lastRead: "آخرین بازدید",
    speed: "سرعت",
    juz: "جزء",
    aboutDev: "درباره سازنده",
    devName: "سید محمد حسین تولیت",
    downloadManager: "مدیریت دانلود‌ها",
    downloadAll: "دانلود کل قرآن",
    updateData: "بروزرسانی داده‌ها",
    deleteData: "حذف همه داده‌ها",
    downloading: "در حال دانلود...",
    updateAvailable: "بروزرسانی موجود است",
    uptodate: "بروز است",
    storageUsed: "حافظه اشغال شده",
    confirmDelete: "آیا مطمئن هستید که می‌خواهید همه داده‌های آفلاین را حذف کنید؟",
    dataMismatch: "تنظیمات (مترجم/قاری/تفسیر) با داده‌های دانلود شده مطابقت ندارد.",
    syncData: "همگام‌سازی و آپدیت",
    selectSurahs: "انتخاب سوره‌ها",
    downloadSelected: "دانلود انتخاب‌شده‌ها",
    selectAll: "انتخاب همه",
    deselectAll: "لغو انتخاب",
    manageDownloads: "مدیریت فایل‌های آفلاین",
    downloadComplete: "دانلود تکمیل شد",
    downloadCompleteBody: "سوره‌های انتخاب شده برای استفاده آفلاین ذخیره شدند.",
    errorLoading: "خطا در دریافت محتوا",
    retry: "تلاش مجدد",
    includeAudio: "دانلود فایل‌های صوتی",
    audioSizeWarning: "دانلود فایل‌های صوتی فضای زیادی (حدود ۶۰۰ مگابایت) اشغال می‌کند.",
    reciterModeRecommended: "پیشنهادی",
    reciterModeAll: "همه",
    includeTafsir: "دانلود تفسیر",
    tafsirSizeWarning: "دریافت تفسیر حجم متن را افزایش می‌دهد (حدود ۱۰ تا ۲۰ مگابایت برای کل قرآن).",
    setup: "راه‌اندازی اولیه",
    finish: "اتمام و ورود",
    downloadText: "فقط متن",
    downloadAudio: "متن + صوت",
    downloadTextTafsir: "متن + تفسیر",
    downloadFull: "متن + تفسیر + صوت",
    listenPreview: "شنیدن نمونه",
    viewMode: "نمایش بر اساس",
    viewSurah: "سوره",
    viewJuz: "جزء (بخش)",
    continueJuz: "ادامه جزء",
    downloadAudioOnly: "دانلود صوت",
    stop: "توقف",
    cancelled: "لغو شد",
    tafsir: "تفسیر (سنتی)",
    selectTafsir: "انتخاب کتاب تفسیر",
    loadingTafsir: "در حال دریافت تفسیر...",
    readTafsir: "مطالعه تفسیر",
    popularTopics: "موضوعات پرطرفدار",
    rateApp: "امتیاز و نظر",
    rateAppDesc: "اگر از قرآن ایلیا راضی هستید، در مایکت به ما امتیاز بدهید و نظرتان را بنویسید.",
    rateCta: "ثبت امتیاز در مایکت",
    ratePromptTitle: "از برنامه راضی هستید؟",
    ratePromptBody: "در صورت رضایت، روی دکمه زیر بزنید تا صفحه ثبت امتیاز و نظر در مایکت باز شود.",
    rateConfirm: "رفتن به مایکت",
    rateLater: "بعداً",
    devCredit: "توسعه یافته توسط: دیکد",
    offlineReady: "داده‌های آفلاین آماده است. می‌توانید سوره‌های دانلودشده را بدون اینترنت بخوانید.",
    offlineMissing: "برای استفاده آفلاین باید آنلاین شوید و از بخش دانلودها داده‌ها را دریافت کنید.",
    goToDownloads: "برو به دانلودها"
  },
  ar: {
    welcome: "مرحبا بكم في قرآن إيليا",
    subtitle: "تجربة القرآن الذكي",
    start: "ابدأ الرحلة",
    continue: "متابعة",
    selectLang: "لغة التطبيق",
    selectTrans: "اختر المترجم",
    selectReciter: "اختر القارئ",
    home: "الرئيسية",
    settings: "الإعدادات",
    search: "بحث",
    dailyVerse: "آية اليوم",
    themes: "المواضيع",
    surahs: "السور",
    downloads: "التحميلات",
    bookmarks: "الإشارات المرجعية",
    playing: "جاري التشغيل",
    auto: "تلقائي",
    scroll: "تمرين",
    downloaded: "تم التحميل",
    download: "تحميل",
    notePlaceholder: "أضف ملاحظة...",
    save: "حفظ",
    cancel: "إلغاء",
    readMore: "اقرأ المزيد",
    searchPlaceholder: "بحث في القرآن...",
    transSearch: "بحث عن المترجمين...",
    reciterSearch: "بحث عن القراء...",
    searchTranslation: "نص الترجمة",
    searchArabic: "النص العربي",
    searchTafsir: "نص التفسير",
    searchSurahName: "اسم السورة",
    searchAyah: "آية",
    searchJuz: "جزء",
    revelationFilter: "مكي / مدني",
    noMatches: "لا توجد نتائج.",
    resetFilters: "إعادة تعيين الفلاتر",
    preview: "معاينة مباشرة",
    tafsirFontLabel: "خط التفسير",
    showDailyVerse: "عرض آية اليوم",
    offlineMode: "وضع غير متصل",
    themeProphets: "قصص الأنبياء",
    themeGuidance: "توجيهات للحياة",
    themeGod: "معرفة الله",
    themeLaw: "الأحكام والشريعة",
    themePatience: "الصبر والأمل",
    themeAfterlife: "الحياة الآخرة",
    themeNature: "الطبيعة والخلق",
    themeEthics: "الأخلاق والمعرفة",
    themeWomen: "النساء في القرآن",
    themeScience: "العلم والعقل",
    themeDua: "الدعاء والمناجاة",
    themeFamily: "الأسرة والعلاقات",
    appearance: "المظهر",
    audioSettings: "إعدادات الصوت",
    arabicSize: "حجم الخط العربي",
    transSize: "حجم خط الترجمة",
    appFontSize: "حجم واجهة التطبيق",
    appFont: "خط التطبيق",
    defaultSpeed: "السرعة الافتراضية",
    arabicFont: "الخط العربي",
    transFont: "خط الترجمة",
    playBismillah: "تشغيل البسملة في البداية",
    reset: "إعادة تعيين الإعدادات",
    all: "جميع السور",
    meccan: "مكية",
    medinan: "مدنية",
    close: "إغلاق",
    intro: "مقدمة",
    filterBy: "تصفية حسب",
    surahOnly: "اسم السورة",
    verseText: "نص الآية",
    aiInsight: "رؤية الذكاء الاصطناعي",
    explainVerse: "شرح الآية",
    loadingAi: "جارٍ استشارة الذكاء الاصطناعي...",
    nextSurah: "السورة التالية",
    matchesFound: "نتائج البحث",
    noDownloads: "لا توجد تحميلات بعد.",
    noBookmarks: "لا توجد إشارات مرجعية بعد.",
    downloadedAt: "تاريخ التحميل",
    continueReading: "متابعة القراءة",
    lastRead: "آخر قراءة",
    speed: "سرعة",
    juz: "جزء",
    aboutDev: "عن المطور",
    devName: "سيد محمد حسین توليات",
    downloadManager: "مدير التحميل",
    downloadAll: "تحميل القرآن كاملاً",
    updateData: "تحديث البيانات",
    deleteData: "حذف جميع البيانات",
    downloading: "جاري التحميل...",
    updateAvailable: "تحديث متاح",
    uptodate: "محدث",
    storageUsed: "التخزين المستخدم",
    confirmDelete: "هل أنت متأكد أنك تريد حذف جميع البيانات غير المتصلة؟",
    dataMismatch: "إعداداتك (المترجم/القارئ/التفسير) لا تتطابق مع البيانات المحمّلة.",
    syncData: "مزامنة / تحديث",
    selectSurahs: "تحديد السور",
    downloadSelected: "تحميل المحدد",
    selectAll: "تحديد الكل",
    deselectAll: "إلغاء التحديد",
    manageDownloads: "إدارة الملفات",
    downloadComplete: "اكتمل التحميل",
    downloadCompleteBody: "تم حفظ السور المحددة للاستخدام دون اتصال.",
    errorLoading: "فشل تحميل المحتوى",
    retry: "إعادة المحاولة",
    includeAudio: "تضمين الصوت",
    audioSizeWarning: "يتطلب تحميل الصوت مساحة كبيرة (حوالي 600 ميجابايت).",
    reciterModeRecommended: "المقترحة",
    reciterModeAll: "الكل",
    includeTafsir: "تحميل التفسير",
    tafsirSizeWarning: "تحميل التفسير يضيف نصاً إضافياً (~10-20 ميغابايت لكامل المصحف).",
    setup: "الإعداد الأولي",
    finish: "إنهاء",
    downloadText: "النص فقط",
    downloadAudio: "نص + صوت",
    downloadTextTafsir: "نص + تفسير",
    downloadFull: "نص + تفسير + صوت",
    listenPreview: "استماع للعينة",
    viewMode: "تصفح حسب",
    viewSurah: "سورة",
    viewJuz: "جزء",
    continueJuz: "متابعة الجزء",
    downloadAudioOnly: "تحميل الصوت",
    stop: "يتوقف",
    cancelled: "تم الإلغاء",
    tafsir: "التفسير",
    selectTafsir: "اختر كتاب التفسير",
    loadingTafsir: "جاري تحميل التفسير...",
    readTafsir: "قراءة التفسير",
    popularTopics: "مواضيع شائعة",
    rateApp: "التقييم والمراجعة",
    rateAppDesc: "إذا أعجبك التطبيق قيّمه في مايكت وشارك تجربتك.",
    rateCta: "تقييم في مايكت",
    ratePromptTitle: "هل أنت راضٍ عن التطبيق؟",
    ratePromptBody: "إذا كنت راضياً سنفتح صفحة التقييم في مايكت لتترك درجة ورأيك.",
    rateConfirm: "فتح مايكت",
    rateLater: "لاحقاً",
    devCredit: "مطوّر بواسطة: دیکد",
    offlineReady: "الحزمة غير المتصلة جاهزة. يمكنك قراءة السور المحمّلة دون إنترنت.",
    offlineMissing: "لا توجد بيانات غير متصلة. اتصل بالإنترنت ونزّل البيانات من قسم التنزيلات.",
    goToDownloads: "الذهاب إلى التنزيلات"
  },
  zh: {
    welcome: "欢迎来到 Quran Ilya",
    subtitle: "智能古兰经体验",
    start: "开始旅程",
    continue: "继续",
    selectLang: "界面语言",
    selectTrans: "选择翻译",
    selectReciter: "选择诵读者",
    home: "首页",
    settings: "设置",
    search: "搜索",
    dailyVerse: "每日经文",
    themes: "主题",
    surahs: "苏勒列表",
    downloads: "下载",
    bookmarks: "书签",
    playing: "正在播放",
    auto: "自动",
    scroll: "滚动",
    downloaded: "已下载",
    download: "下载",
    notePlaceholder: "添加个人笔记...",
    save: "保存",
    cancel: "取消",
    readMore: "阅读更多",
    searchPlaceholder: "搜索古兰经...",
    transSearch: "搜索翻译...",
    reciterSearch: "搜索诵读者...",
    searchTranslation: "翻译文本",
    searchArabic: "阿拉伯文本",
    searchTafsir: "注释文本",
    searchSurahName: "苏勒名称",
    searchAyah: "经文 (Ayah)",
    searchJuz: "卷 (Juz)",
    revelationFilter: "麦加 / 麦地那",
    noMatches: "未找到结果。",
    resetFilters: "重置筛选",
    preview: "实时预览",
    tafsirFontLabel: "注释字体",
    showDailyVerse: "显示每日经文",
    offlineMode: "离线模式",
    themeProphets: "先知的故事",
    themeGuidance: "生活指南",
    themeGod: "对真主的认知",
    themeLaw: "法律与法理",
    themePatience: "耐心与希望",
    themeAfterlife: "后世",
    themeNature: "自然与创造",
    themeEthics: "道德与伦理",
    themeWomen: "古兰经中的女性",
    themeScience: "科学与理性",
    themeDua: "祈祷 (Dua)",
    themeFamily: "家庭与关系",
    appearance: "外观",
    audioSettings: "音频设置",
    arabicSize: "阿拉伯字体大小",
    transSize: "翻译字体大小",
    appFontSize: "应用界面缩放",
    appFont: "应用字体",
    defaultSpeed: "默认播放速度",
    arabicFont: "阿拉伯字体",
    transFont: "翻译字体",
    playBismillah: "开始时播放太斯米",
    reset: "重置设置",
    all: "所有苏勒",
    meccan: "麦加",
    medinan: "麦地那",
    close: "关闭",
    intro: "介绍",
    filterBy: "筛选",
    surahOnly: "苏勒名称",
    verseText: "经文文本",
    aiInsight: "AI 见解",
    explainVerse: "解释经文",
    loadingAi: "正在咨询 AI...",
    nextSurah: "下一个苏勒",
    matchesFound: "找到匹配项",
    noDownloads: "暂无下载。",
    noBookmarks: "暂无书签。",
    downloadedAt: "下载日期",
    continueReading: "继续阅读",
    lastRead: "上次阅读",
    speed: "速度",
    juz: "卷",
    aboutDev: "关于开发者",
    devName: "Seyed Mohammad Hossein Toliyat",
    downloadManager: "下载管理器",
    downloadAll: "下载整部古兰经",
    updateData: "更新数据",
    deleteData: "删除所有数据",
    downloading: "正在下载...",
    updateAvailable: "可用更新",
    uptodate: "最新",
    storageUsed: "已用存储",
    confirmDelete: "您确定要删除所有离线数据吗？",
    dataMismatch: "您的设置（翻译/诵读/注释）与下载的数据不匹配。",
    syncData: "同步/更新数据",
    selectSurahs: "选择苏勒",
    downloadSelected: "下载所选",
    selectAll: "全选",
    deselectAll: "取消全选",
    manageDownloads: "管理下载",
    downloadComplete: "下载完成",
    downloadCompleteBody: "所选苏勒已保存供离线使用。",
    errorLoading: "加载内容失败",
    retry: "重试",
    includeAudio: "包括音频",
    audioSizeWarning: "下载音频需要大量空间（约600MB）。",
    reciterModeRecommended: "推荐",
    reciterModeAll: "全部",
    includeTafsir: "包含注释",
    tafsirSizeWarning: "下载注释会增加文本体积（全本约10-20MB）。",
    setup: "首次设置",
    finish: "完成",
    downloadText: "仅文本",
    downloadAudio: "文本 + 音频",
    downloadTextTafsir: "文本 + 注释",
    downloadFull: "文本 + 注释 + 音频",
    listenPreview: "试听",
    viewMode: "浏览方式",
    viewSurah: "苏勒",
    viewJuz: "卷 (Juz)",
    continueJuz: "继续卷",
    downloadAudioOnly: "下载音频",
    stop: "停止",
    cancelled: "已取消",
    tafsir: "古兰经注",
    selectTafsir: "选择注释书",
    loadingTafsir: "正在加载注释...",
    readTafsir: "阅读注释",
    popularTopics: "热门话题",
    rateApp: "评分与评论",
    rateAppDesc: "如果喜欢 Quran Ilya，请在 Myket 给出评分并分享体验。",
    rateCta: "在 Myket 评分",
    ratePromptTitle: "喜欢这个应用吗？",
    ratePromptBody: "如果满意，我们会打开 Myket 的评分页面，请留下评分和评论。",
    rateConfirm: "打开 Myket",
    rateLater: "稍后",
    devCredit: "开发: دیکد",
    offlineReady: "离线包已就绪，可在无网络时阅读已下载的章节。",
    offlineMissing: "尚未下载离线数据，请联网并在 «下载» 中获取。",
    goToDownloads: "打开下载"
  }
};

const THEMES: ThemeCategory[] = [
  { id: 'prophets', titleKey: 'themeProphets', surahIds: [10, 11, 12, 14, 19, 21, 28, 37, 71], imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=300&auto=format&fit=crop" },
  { id: 'guidance', titleKey: 'themeGuidance', surahIds: [1, 2, 3, 4, 17, 18, 24, 31, 49], imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop" },
  { id: 'god', titleKey: 'themeGod', surahIds: [1, 59, 112, 113, 114, 55, 67], imageUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=300&auto=format&fit=crop" },
  { id: 'law', titleKey: 'themeLaw', surahIds: [2, 4, 5, 24, 65], imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300&auto=format&fit=crop" },
  { id: 'patience', titleKey: 'themePatience', surahIds: [12, 18, 21, 29, 31, 94, 103], imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop" },
  { id: 'afterlife', titleKey: 'themeAfterlife', surahIds: [56, 69, 75, 76, 78, 81, 82, 83, 84], imageUrl: "https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?q=80&w=300&auto=format&fit=crop" },
  { id: 'nature', titleKey: 'themeNature', surahIds: [13, 16, 27, 30, 35, 41, 55], imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=300&auto=format&fit=crop" },
  { id: 'ethics', titleKey: 'themeEthics', surahIds: [17, 31, 49, 103, 104, 107], imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=300&auto=format&fit=crop" },
  { id: 'women', titleKey: 'themeWomen', surahIds: [4, 19, 24, 33, 58, 60, 65, 66], imageUrl: "https://imgix.bustle.com/nylon/18439105/origin.png?w=1200&h=1200&fit=crop&crop=faces&fm=jpg" },
  { id: 'science', titleKey: 'themeScience', surahIds: [21, 23, 24, 30, 39, 41, 51, 86], imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop" },
  { id: 'dua', titleKey: 'themeDua', surahIds: [1, 3, 14, 25, 28, 40, 59, 66, 71], imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop" },
  { id: 'family', titleKey: 'themeFamily', surahIds: [4, 14, 19, 25, 31, 46, 64, 66], imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=300&auto=format&fit=crop" }
];

// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 dark:border-primary-400"></div>
  </div>
);

const SurahSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse flex items-start justify-between">
        <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4"></div>
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-10"></div>
        </div>
    </div>
);

const SurahReaderSkeleton = () => (
  <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-950 animate-pulse">
    <div className="h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800"></div>
    <div className="p-4 space-y-6 max-w-4xl mx-auto w-full mt-4">
       <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto w-3/4 opacity-50"></div>
       {[1,2,3].map(i => (
          <div key={i} className="space-y-4 p-6 bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                 <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                 </div>
              </div>
              <div className="space-y-3">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 ml-auto"></div>
              </div>
              <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-2/3"></div>
              </div>
          </div>
       ))}
    </div>
  </div>
);

const IconButton = ({ onClick, icon: Icon, active = false, className = "", badge = false }: any) => (
  <button 
    onClick={(e) => {
        e.stopPropagation();
        if(onClick) onClick(e);
    }}
    className={`p-2 rounded-full transition-colors relative ${active ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400'} ${className}`}
  >
    <Icon size={24} />
    {badge && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"></span>}
  </button>
);

// --- Onboarding Component ---

const Onboarding = ({ 
    settings, 
    setSettings, 
    translations, 
    reciters, 
    tafsirs,
    t, 
    onComplete 
}: any) => {
    const [step, setStep] = useState(1);
    const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [reciterMode, setReciterMode] = useState<'recommended' | 'all'>('recommended');

    const playPreview = (reciterId: string) => {
        if(audioPreview) {
            audioPreview.pause();
            if(isPlayingPreview) {
                setIsPlayingPreview(false);
                return;
            }
        }
        // Play Al-Fatiha Verse 1 as sample
        const audio = new Audio(`https://cdn.islamic.network/quran/audio/128/${reciterId}/1.mp3`);
        audio.play();
        setAudioPreview(audio);
        setIsPlayingPreview(true);
        audio.onended = () => setIsPlayingPreview(false);
    };

    useEffect(() => {
        return () => {
            if(audioPreview) audioPreview.pause();
        }
    }, [audioPreview]);

    const filteredTranslations = translations.filter((tr: any) => tr.language === settings.uiLanguage);
    const finalTranslations = filteredTranslations.length > 0 ? filteredTranslations : translations.filter((tr: any) => tr.language === 'en');

    // Filter Tafsirs: prioritize current language, but show all if few options
    const filteredTafsirs = tafsirs.filter((tf: any) => tf.language === settings.uiLanguage);
    const finalTafsirs = filteredTafsirs.length > 0 ? filteredTafsirs : tafsirs;
    
    const displayedReciters = reciterMode === 'all' 
        ? reciters 
        : reciters.filter((r: any) => RECOMMENDED_RECITER_IDS.includes(r.identifier)).concat(
            reciters.filter((r: any) => !RECOMMENDED_RECITER_IDS.includes(r.identifier)).slice(0, 10)
        );

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-dark-950 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full text-center">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/40">
                        <BookOpen size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.setup}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t.subtitle}</p>
                </div>

                <div className="w-full space-y-6">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <h2 className="text-lg font-bold mb-4">{t.selectLang}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setSettings({...settings, uiLanguage: lang.id})}
                                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${settings.uiLanguage === lang.id ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900' : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800'}`}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className={`font-medium ${settings.uiLanguage === lang.id ? 'text-primary-700' : 'text-slate-600 dark:text-slate-400'}`}>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <h2 className="text-lg font-bold mb-4">{t.selectTrans}</h2>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {finalTranslations.map((tr: any) => (
                                    <button
                                        key={tr.identifier}
                                        onClick={() => setSettings({...settings, translationIdentifier: tr.identifier})}
                                        className={`w-full p-3 rounded-xl border text-left transition-all ${settings.translationIdentifier === tr.identifier ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-200' : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800'}`}
                                    >
                                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{tr.name}</div>
                                        <div className="text-xs text-slate-500">{tr.englishName}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <h2 className="text-lg font-bold mb-4">{t.selectTafsir}</h2>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {finalTafsirs.map((tf: any) => (
                                    <button
                                        key={tf.identifier}
                                        onClick={() => setSettings({...settings, tafsirIdentifier: tf.identifier})}
                                        className={`w-full p-3 rounded-xl border text-left transition-all ${settings.tafsirIdentifier === tf.identifier ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-200' : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800'}`}
                                    >
                                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{tf.name}</div>
                                        <div className="text-xs text-slate-500">{tf.englishName}</div>
                                    </button>
                                ))}
                                {finalTafsirs.length === 0 && (
                                    <p className="text-sm text-slate-500">No specific Tafseer available for this language. Defaulting to Arabic/English.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <h2 className="text-lg font-bold mb-4">{t.selectReciter}</h2>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input className="w-full pl-10 p-3 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl" placeholder={t.reciterSearch} />
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                <div className="flex items-center gap-2 mb-3">
                                    <button 
                                      onClick={() => setReciterMode('recommended')} 
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${reciterMode === 'recommended' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        {t.reciterModeRecommended}
                                    </button>
                                    <button 
                                      onClick={() => setReciterMode('all')} 
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${reciterMode === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        {t.reciterModeAll}
                                    </button>
                                </div>
                                {displayedReciters.map((rec: any) => (
                                    <div
                                        key={rec.identifier}
                                        onClick={() => setSettings({...settings, reciterIdentifier: rec.identifier})}
                                        className={`w-full p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${settings.reciterIdentifier === rec.identifier ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-200' : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800'}`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{rec.name}</div>
                                            <div className="text-xs text-slate-500">{rec.englishName}</div>
                                        </div>
                                        {settings.reciterIdentifier === rec.identifier && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); playPreview(rec.identifier); }}
                                                className="p-2 bg-primary-600 text-white rounded-full hover:scale-105 transition-transform"
                                            >
                                                {isPlayingPreview ? <Pause size={16}/> : <Play size={16}/>}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                         <div className="animate-in fade-in slide-in-from-right-8 duration-300 text-center">
                            <h2 className="text-lg font-bold mb-6">{t.appearance}</h2>
                            <div className="bg-slate-50 dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                                <p className={`text-2xl mb-4 ${settings.arabicFont}`} dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                                <p className={`text-sm text-slate-600 dark:text-slate-400 ${settings.translationFont}`}>In the name of God, the Most Gracious, the Most Merciful</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
                                {FONTS_ARABIC.map(f => (
                                    <button key={f.id} onClick={() => setSettings({...settings, arabicFont: f.id})} className={`px-3 py-1 text-xs rounded-full border ${settings.arabicFont === f.id ? 'bg-primary-600 text-white' : 'border-slate-300'}`}>{f.label}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-950 flex justify-between">
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-slate-500 font-bold">{t.cancel}</button>
                )}
                <div className="flex-1"></div>
                <button 
                    onClick={() => {
                        if(step < 5) setStep(step + 1);
                        else onComplete();
                    }}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center gap-2"
                >
                    {step === 5 ? t.finish : t.continue} <ChevronRight size={18} />
                </button>
            </div>
            
            {/* Step Indicators */}
            <div className="flex gap-1 h-1 w-full absolute top-0 left-0">
                {[1,2,3,4,5].map(s => (
                    <div key={s} className={`flex-1 transition-all duration-500 ${s <= step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                ))}
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  // --- State ---
  const [view, setView] = useState<ViewState>('HOME');
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    uiLanguage: 'en',
    translationIdentifier: 'en.asad',
    reciterIdentifier: 'ar.alafasy',
    tafsirIdentifier: 'ar.jalalayn', // Default Tafseer
    onboardingComplete: false,
    theme: 'light',
    arabicFontSize: 3,
    translationFontSize: 2,
    tafsirFontSize: 2,
    uiFontSize: 3, 
    arabicFont: 'font-arabic',
    translationFont: 'font-persian',
    tafsirFont: 'font-translation-modern',
    appFont: 'font-sans',
    defaultPlaybackRate: 1,
    showDailyVerse: true,
    playBismillah: true
  });
  
  const currentLang = LANGUAGES.find(l => l.id === settings.uiLanguage) || LANGUAGES[0];
  const t = UI_TEXT[settings.uiLanguage] || UI_TEXT.en;
  const isRTL = currentLang.dir === 'rtl';

  // Data
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(null);
  const [translations, setTranslations] = useState<Edition[]>([]);
  const [reciters, setReciters] = useState<Edition[]>([]);
  const [reciterMode, setReciterMode] = useState<'recommended' | 'all'>('all');
  const [tafsirs, setTafsirs] = useState<Edition[]>([]);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [isDailyVerseLoading, setIsDailyVerseLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [offlineSurahs, setOfflineSurahs] = useState<any[]>([]);
  const [lastRead, setLastRead] = useState<LastReadState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSurahLoading, setIsSurahLoading] = useState(false);
  const [surahError, setSurahError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Browsing Mode
  const [browseMode, setBrowseMode] = useState<'surah' | 'juz'>('surah');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [juzProgress, setJuzProgress] = useState<JuzProgress[]>([]);

  // Download Manager State
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [offlineMetadata, setOfflineMetadata] = useState<any>(null);
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [includeTafsir, setIncludeTafsir] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Search
  const [searchModes, setSearchModes] = useState<Set<string>>(new Set(['translation', 'arabic', 'surah']));
  const [searchJuzFilter, setSearchJuzFilter] = useState<number | null>(null);
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPlayingBismillah, setIsPlayingBismillah] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(settings.defaultPlaybackRate || 1);

  // Search/Tafseer
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string|null>(null);
  const [activeTafsir, setActiveTafsir] = useState<{id: string, text: string} | null>(null);
  const [isTafsirLoading, setIsTafsirLoading] = useState(false);
  
  // Quick Settings in Surah View
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // --- Effects ---
  
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', settings.uiLanguage);
    
    const body = document.body;
    body.classList.remove('font-sans', 'font-arabic', 'font-persian', 'font-naskh', 'font-scheherazade', 'font-lateef', 'font-cairo', 'font-arabic-sans', 'font-translation-modern');
    body.classList.remove('font-translation-modern');
    body.classList.add(currentLang.font);
    if (settings.appFont) {
        body.classList.add(settings.appFont);
    }

    const scaleMap = [85, 92.5, 100, 107.5, 115];
    const scale = scaleMap[Math.min(4, Math.max(0, settings.uiFontSize - 1))];
    document.documentElement.style.fontSize = `${scale}%`;

  }, [settings.theme, settings.uiLanguage, isRTL, currentLang, settings.uiFontSize]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const updateNetworkStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    return () => {
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const savedSettings = localStorage.getItem('nurai_settings');
      let loadedSettings = settings;
      if (savedSettings) {
        loadedSettings = { ...settings, ...JSON.parse(savedSettings) };
        setSettings(loadedSettings);
      }
      // Apply defaults for new fields if missing
      setSettings(s => ({
        ...s,
        tafsirFontSize: loadedSettings.tafsirFontSize || 2,
        appFont: loadedSettings.appFont || 'font-sans',
        defaultPlaybackRate: loadedSettings.defaultPlaybackRate || 1
      }));
      if (loadedSettings.showDailyVerse === undefined) {
        setSettings(s => ({...s, showDailyVerse: true}));
        loadedSettings.showDailyVerse = true;
      }

      const savedBookmarks = localStorage.getItem('nurai_bookmarks');
      if (savedBookmarks) {
        try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.warn("Bookmark parse error", e); }
      }

      const savedLastRead = localStorage.getItem('nurai_lastRead');
      if (savedLastRead) setLastRead(JSON.parse(savedLastRead));
      
      const savedJuzProgress = localStorage.getItem('nurai_juzProgress');
      if (savedJuzProgress) setJuzProgress(JSON.parse(savedJuzProgress));

      const cachedSurahs = localStorage.getItem('nurai_surahList');
      const cachedTranslations = localStorage.getItem('nurai_translations');
      const cachedReciters = localStorage.getItem('nurai_reciters');
      const cachedTafsirs = localStorage.getItem('nurai_tafsirs');

      if (cachedSurahs) {
          const parsed = JSON.parse(cachedSurahs);
          setSurahList(parsed);
          setFilteredSurahs(parsed);
      }
      if (cachedTranslations) setTranslations(JSON.parse(cachedTranslations));
      if (cachedReciters) setReciters(JSON.parse(cachedReciters));
      if (cachedTafsirs) setTafsirs(JSON.parse(cachedTafsirs));

      const downloads = await API.getDownloadedSurahs();
      const meta = await API.getOfflineMetadata();
      setOfflineSurahs(downloads);
      setOfflineMetadata(meta);

      let list: Surah[] = [];
      try {
          list = await API.fetchSurahList();
          if (list.length) {
              setSurahList(list);
              setFilteredSurahs(list);
              localStorage.setItem('nurai_surahList', JSON.stringify(list));
          }
      } catch (e) {
          console.warn("Failed to load Surah list from network", e);
      }

      if (list.length === 0) {
          if (cachedSurahs) {
              const parsed = JSON.parse(cachedSurahs);
              setSurahList(parsed);
              setFilteredSurahs(parsed);
          } else if (downloads.length > 0) {
              const derived = await deriveSurahListFromOffline(downloads);
              setSurahList(derived);
              setFilteredSurahs(derived);
              localStorage.setItem('nurai_surahList', JSON.stringify(derived));
          }
      }
      
      let trans: Edition[] = [];
      try { trans = await API.fetchEditions('translation'); } catch (e) { console.warn(e); }
      if (trans.length) {
          setTranslations(trans);
          localStorage.setItem('nurai_translations', JSON.stringify(trans));
      } else if (cachedTranslations) {
          setTranslations(JSON.parse(cachedTranslations));
      }

      let recs: Edition[] = [];
      try { recs = await API.fetchEditions('versebyverse'); } catch (e) { console.warn(e); }
      if (recs.length) {
          const sorted = [...recs].sort((a, b) => a.name.localeCompare(b.name));
          setReciters(sorted);
          localStorage.setItem('nurai_reciters', JSON.stringify(sorted));
      } else if (cachedReciters) {
          try {
            const parsed = JSON.parse(cachedReciters);
            setReciters(parsed);
          } catch (e) {
            console.warn("Reciter cache parse error", e);
          }
      }

      let tafs: Edition[] = [];
      try { tafs = await API.fetchEditions('tafsir'); } catch (e) { console.warn(e); }
      if (tafs.length) {
          setTafsirs(tafs);
          localStorage.setItem('nurai_tafsirs', JSON.stringify(tafs));
      } else if (cachedTafsirs) {
          setTafsirs(JSON.parse(cachedTafsirs));
      }
      
      if (loadedSettings.onboardingComplete) {
         API.requestNotificationPermission();
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []); 

  const refreshDownloads = async () => {
      const dl = await API.getDownloadedSurahs();
      const meta = await API.getOfflineMetadata();
      setOfflineSurahs(dl);
      setOfflineMetadata(meta);
  };
  
  const deriveSurahListFromOffline = async (downloads: any[]): Promise<Surah[]> => {
      const derived: Surah[] = [];
      for (const d of downloads) {
          const detail = await API.getOfflineSurah(d.number);
          if (detail) {
              derived.push({
                  number: detail.number,
                  name: detail.name,
                  englishName: detail.englishName,
                  englishNameTranslation: detail.englishNameTranslation,
                  numberOfAyahs: detail.numberOfAyahs,
                  revelationType: detail.revelationType
              });
          } else {
              derived.push({
                  number: d.number,
                  name: d.name || `سوره ${d.number}`,
                  englishName: d.englishName || `Surah ${d.number}`,
                  englishNameTranslation: "",
                  numberOfAyahs: d.numberOfAyahs || 0,
                  revelationType: d.revelationType || ''
              } as Surah);
          }
      }
      return derived;
  };

  useEffect(() => {
    if (settings.onboardingComplete) {
        if (settings.showDailyVerse) {
            const getDaily = async () => {
                setIsDailyVerseLoading(true);
                const dv = await API.fetchDailyVerse(settings.translationIdentifier, settings.reciterIdentifier);
                if (dv) {
                    setDailyVerse(dv);
                }
                setIsDailyVerseLoading(false);
            };
            getDaily();
        } else {
            setDailyVerse(null);
        }
    }
  }, [settings.onboardingComplete, settings.translationIdentifier, settings.reciterIdentifier, settings.showDailyVerse]);

  useEffect(() => {
    if(settings.onboardingComplete) {
        localStorage.setItem('nurai_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    try {
        localStorage.setItem('nurai_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
        console.warn("Bookmark persistence failed", e);
    }
  }, [bookmarks]);

  useEffect(() => {
    if(view === 'SURAH' && currentSurah) {
        const ayahNum = currentAyahIndex > -1 ? currentSurah.ayahs[currentAyahIndex].numberInSurah : 1;
        const simpleSurah = { 
            number: currentSurah.number, 
            name: currentSurah.name, 
            englishName: currentSurah.englishName, 
            englishNameTranslation: currentSurah.englishNameTranslation,
            numberOfAyahs: currentSurah.numberOfAyahs, 
            revelationType: currentSurah.revelationType 
        };
        const record: LastReadState = { 
            surah: simpleSurah, 
            ayahNumber: ayahNum,
            timestamp: Date.now(),
            juzNumber: selectedJuz || undefined
        };
        setLastRead(record);
        localStorage.setItem('nurai_lastRead', JSON.stringify(record));
        
        // Update Juz Progress if applicable
        if (selectedJuz) {
            const currentJuzProg = {
                juzNumber: selectedJuz,
                lastSurahNumber: currentSurah.number,
                lastAyahNumber: ayahNum,
                timestamp: Date.now(),
                percentage: 0 // Simplification: precise calculation requires total Ayahs in Juz
            };
            const updatedProg = [...juzProgress.filter(p => p.juzNumber !== selectedJuz), currentJuzProg];
            setJuzProgress(updatedProg);
            localStorage.setItem('nurai_juzProgress', JSON.stringify(updatedProg));
        }
    }
  }, [currentSurah, currentAyahIndex, view]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.playbackRate = playbackRate;
      }
  }, [playbackRate]);

  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.playbackRate = playbackRate;
      }
  }, [audioUrl]);

  useEffect(() => {
      if (settings.defaultPlaybackRate && settings.defaultPlaybackRate !== playbackRate) {
          setPlaybackRate(settings.defaultPlaybackRate);
      }
  }, [settings.defaultPlaybackRate]);

  useEffect(() => {
      if(autoScroll && currentSurah && currentAyahIndex >= 0 && view === 'SURAH' && !isPlayingBismillah) {
          const el = document.getElementById(`ayah-${currentAyahIndex}`);
          if(el) {
              el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          }
      }
  }, [currentAyahIndex, view, autoScroll, isPlayingBismillah, prefersReducedMotion]);

  // --- Handlers ---

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };
  
  const requestRating = () => setShowRatingDialog(true);

  const openRatingPage = () => {
    setShowRatingDialog(false);
    try {
        window.location.href = MYKET_COMMENT_URL;
        setTimeout(() => {
            window.open(MYKET_COMMENT_WEB, '_blank');
        }, 1200);
    } catch (e) {
        window.open(MYKET_COMMENT_WEB, '_blank');
    }
  };

  const playAyah = (index: number, url?: string, contextSurah?: any) => {
    if (contextSurah) {
        const tempSurah: SurahDetail = {
            ...contextSurah.surah,
            ayahs: [{
                number: 0,
                text: contextSurah.text,
                numberInSurah: contextSurah.numberInSurah,
                juz: 0, manzil: 0, page: 0, ruku: 0, hizbQuarter: 0, sajda: false,
                translation: contextSurah.translation,
                audio: contextSurah.audio
            }],
            numberOfAyahs: contextSurah.surah.numberOfAyahs || 1,
            revelationType: 'Meccan',
            englishName: contextSurah.surah.englishName || 'Unknown',
            englishNameTranslation: '',
            name: contextSurah.surah.name || 'Surah'
        };
        setCurrentSurah(tempSurah);
        setCurrentAyahIndex(0);
        setAudioUrl(url || "");
        setIsPlayerVisible(true);
        setIsPlaying(true);
        if (audioRef.current) audioRef.current.playbackRate = playbackRate;
        return;
    }

    if (!currentSurah) return;
    setIsPlayerVisible(true);

    if(index === currentAyahIndex && isPlaying && !url) {
        setIsPlaying(false);
        return;
    }
    
    if (index === 0 && settings.playBismillah && currentSurah.number !== 1 && currentSurah.number !== 9 && !url && !isPlayingBismillah) {
        const bismillahUrl = `https://cdn.islamic.network/quran/audio/128/${settings.reciterIdentifier}/1.mp3`;
        setIsPlayingBismillah(true);
        setAudioUrl(bismillahUrl);
        setIsPlaying(true);
        setCurrentAyahIndex(-1); 
        return;
    }

    if (index < 0) return;
    
    let targetUrl = url || currentSurah.ayahs[index].audio;
    if (!targetUrl && currentSurah.ayahs[index].number) {
        targetUrl = `https://cdn.islamic.network/quran/audio/128/${settings.reciterIdentifier}/${currentSurah.ayahs[index].number}.mp3`;
    }

    if (targetUrl) {
      setIsPlayingBismillah(false);
      setAudioUrl(targetUrl);
      setCurrentAyahIndex(index);
      setIsPlaying(true);
      if (audioRef.current) audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleAyahEnd = () => {
    if (isPlayingBismillah) {
        setIsPlayingBismillah(false);
        playAyah(0);
        return;
    }

    if (currentSurah && currentAyahIndex < currentSurah.ayahs.length - 1) {
       if(isAutoPlay) playAyah(currentAyahIndex + 1);
       else setIsPlaying(false);
    } else {
      if (isAutoPlay && currentSurah && currentSurah.number < 114) {
          if (currentSurah.ayahs.length > 1) {
            handleSurahClick(currentSurah.number + 1, true);
          } else {
             setIsPlaying(false);
          }
      } else {
          setIsPlaying(false);
      }
    }
  };

  const handleSurahClick = async (surahNumber: number, autoPlayStart = false) => {
    if (isOffline && offlineSurahs.length === 0) {
        alert(t.offlineMissing);
        setView('DOWNLOADS');
        return;
    }
    setView('SURAH');
    setIsSurahLoading(true);
    setSurahError(false);
    setCurrentSurah(null); 
    setIsPlaying(false);
    setCurrentAyahIndex(-1);
    setIsPlayingBismillah(false);
    setShowQuickSettings(false);
    setActiveTafsir(null);
    
    const data = await API.fetchSurahDetail(surahNumber, settings.reciterIdentifier, settings.translationIdentifier);
    if (!data) {
        setSurahError(true);
    } else {
        setCurrentSurah(data);
    }
    setIsSurahLoading(false);
    
    if (autoPlayStart && data) {
         setTimeout(() => {
             playAyah(0);
         }, 800);
    }
  };

  const toggleBookmark = (surah: Surah | SurahDetail, ayah?: Ayah) => {
      let id = "";
      let surahName = surah.englishName;

      if (ayah) {
          id = `${surah.number}:${ayah.numberInSurah}`;
      } else {
          id = `surah_${surah.number}`;
      }

      const exists = bookmarks.find(b => b.id === id);
      
      if(exists) {
          setBookmarks(bookmarks.filter(b => b.id !== id));
      } else {
          setBookmarks([...bookmarks, {
              id,
              surahNumber: surah.number,
              ayahNumber: ayah?.numberInSurah, 
              surahName: surahName,
              timestamp: Date.now()
          }]);
      }
  };

  const saveNote = (id: string) => {
      const updated = bookmarks.map(b => b.id === id ? { ...b, note: noteInput } : b);
      setBookmarks(updated);
      setEditingNoteId(null);
      setNoteInput("");
  };

  const downloadCurrentSurah = async (withAudio = false, withTafsir = false) => {
      if(!currentSurah) return;
      alert("Starting download... this may take a moment.");
      await API.downloadSurahs(
          [currentSurah], 
          settings.translationIdentifier, 
          settings.reciterIdentifier, 
          withAudio, 
          withTafsir, 
          settings.tafsirIdentifier, 
          () => {}
      );
      refreshDownloads();
      setShowDownloadMenu(false);
      alert(t.downloaded);
  };
  
  const handleUpdateData = async () => {
      if(confirm("This will clear old audio/text data and re-download selected Surahs with your new settings. Continue?")) {
          // Clear old audio cache since it might be a different reciter
          await API.clearOfflineAudio();
          // We can optionally clear text too, but saveOfflineSurah overwrites text.
          
          handleBulkDownload();
      }
  };

  const handleBulkDownload = async () => {
      let listToDownload = surahList;
      
      if (isSelectionMode && selectedSurahs.size > 0) {
          listToDownload = surahList.filter(s => selectedSurahs.has(s.number));
      }

      // Cancel previous if active
      if (abortControllerRef.current) abortControllerRef.current.abort();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsDownloadingAll(true);
      setDownloadProgress(0);
      setDownloadStatus("Starting...");
      
      try {
          await API.downloadSurahs(
              listToDownload, 
              settings.translationIdentifier, 
              settings.reciterIdentifier, 
              includeAudio, 
              includeTafsir,
              settings.tafsirIdentifier,
              (progress, name) => {
                  setDownloadProgress(progress);
                  setDownloadStatus(`${name}`);
              },
              controller.signal
          );
          
          setIsDownloadingAll(false);
          refreshDownloads();
          API.sendNotification(t.downloadComplete, t.downloadCompleteBody);
          alert(t.downloadComplete);
          setIsSelectionMode(false);
          setSelectedSurahs(new Set());
      } catch (error: any) {
          if (error.name === 'AbortError') {
              setDownloadStatus(t.cancelled);
              setIsDownloadingAll(false);
              refreshDownloads(); 
          } else {
              console.error(error);
              setDownloadStatus("Error");
              setIsDownloadingAll(false);
          }
      } finally {
          abortControllerRef.current = null;
      }
  };

  const cancelDownload = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
  };

  const handleDeleteAll = async () => {
      if(confirm(t.confirmDelete)) {
          await API.clearAllDownloads();
          refreshDownloads();
      }
  };

  const toggleSurahSelection = (id: number) => {
      const next = new Set(selectedSurahs);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedSurahs(next);
  };
  
  const downloadAudioOnly = async (surahNumber: number) => {
      const surah = surahList.find(s => s.number === surahNumber);
      if(!surah) return;
      
      alert(`Downloading audio for ${surah.englishName}...`);
      await API.downloadSurahs([surah], settings.translationIdentifier, settings.reciterIdentifier, true, false, settings.tafsirIdentifier, (progress) => {});
      refreshDownloads();
      alert("Audio Download Complete");
  };

  const toggleSearchMode = (mode: string) => {
    setSearchModes(prev => {
        const next = new Set(prev);
        if (next.has(mode)) next.delete(mode);
        else next.add(mode);
        if (next.size === 0) next.add('translation');
        return next;
    });
  };

  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || searchQuery).trim();
    if (!q) return;
    
    if(overrideQuery) setSearchQuery(overrideQuery);

    setIsSearching(true);
    setSearchResults(null);
    setSearchError(null);

    const scopes = Array.from(searchModes);
    const tasks: { source: string, promise: Promise<any> }[] = [];
    let localError: string | null = null;

    if (scopes.includes('translation')) {
        tasks.push({ source: 'translation', promise: API.searchQuran(q, settings.translationIdentifier) });
    }
    if (scopes.includes('arabic')) {
        tasks.push({ source: 'arabic', promise: API.searchQuran(q, 'quran-uthmani') });
    }
    if (scopes.includes('tafsir')) {
        tasks.push({ source: 'tafsir', promise: API.searchQuran(q, settings.tafsirIdentifier || 'ar.jalalayn') });
    }

    const allMatches: any[] = [];
    try {
        const results = await Promise.allSettled(tasks.map(t => t.promise));
        results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value?.matches) {
                res.value.matches.forEach((m: any) => {
                    allMatches.push({ ...m, _source: tasks[idx].source });
                });
            }
        });
    } catch (e) {
        localError = t.errorLoading;
    }

    // Surah name search
    if (scopes.includes('surah')) {
        const nameMatches = surahList.filter(s => 
            s.name.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || s.englishNameTranslation.toLowerCase().includes(q.toLowerCase())
        ).map(s => ({
            surah: s,
            numberInSurah: 0,
            text: `${s.englishName} / ${s.name}`,
            _source: 'surah'
        }));
        allMatches.push(...nameMatches);
    }

    // Direct ayah reference e.g. 2:255
    const ayahPattern = q.match(/^([0-9]{1,3})[:\\s]([0-9]{1,3})$/);
    if (scopes.includes('ayah') && ayahPattern) {
        const surahNo = parseInt(ayahPattern[1], 10);
        const ayahNo = parseInt(ayahPattern[2], 10);
        const detail = await API.fetchSurahDetail(surahNo, settings.reciterIdentifier, settings.translationIdentifier);
        const targetAyah = detail?.ayahs?.find(a => a.numberInSurah === ayahNo);
        if (detail && targetAyah) {
            allMatches.push({
                surah: detail,
                numberInSurah: ayahNo,
                text: scopes.includes('tafsir') && targetAyah.tafsir ? targetAyah.tafsir : (scopes.includes('arabic') ? targetAyah.text : targetAyah.translation),
                _source: 'ayah'
            });
        }
    }

    // Offline fallback
    if (allMatches.length === 0 && offlineSurahs.length > 0) {
        for (const meta of offlineSurahs) {
            const detail = await API.getOfflineSurah(meta.number);
            if (!detail) continue;
            detail.ayahs.forEach((ayah) => {
                const textMatch = scopes.includes('translation') && ayah.translation?.toLowerCase().includes(q.toLowerCase());
                const arabicMatch = scopes.includes('arabic') && ayah.text.toLowerCase().includes(q.toLowerCase());
                const tafsirMatch = scopes.includes('tafsir') && ayah.tafsir && ayah.tafsir.toLowerCase().includes(q.toLowerCase());
                if (textMatch || arabicMatch || tafsirMatch) {
                    allMatches.push({
                        surah: detail,
                        numberInSurah: ayah.numberInSurah,
                        text: textMatch ? ayah.translation : tafsirMatch ? ayah.tafsir : ayah.text,
                        _source: textMatch ? 'translation-offline' : tafsirMatch ? 'tafsir-offline' : 'arabic-offline'
                    });
                }
            });
        }
    }

    // Remote fallback translation search if API does not support this edition
    if (scopes.includes('translation') && allMatches.length === 0 && !isOffline) {
        try {
            const fallback = await API.searchQuranFallbackTranslation(q, settings.translationIdentifier, surahList, 25);
            allMatches.push(...fallback.matches.map((m: any) => ({ ...m, _source: 'translation-fallback' })));
        } catch (e) {
            localError = localError || t.errorLoading;
        }
    }

    // Apply juz filter
    const filterByJuz = (surahNumber: number) => {
        if (!searchJuzFilter) return true;
        const start = JUZ_MAPPING[searchJuzFilter] || 1;
        const end = JUZ_MAPPING[searchJuzFilter + 1] || 115;
        return surahNumber >= start && surahNumber < end;
    };

    const filterByRevelation = (surahNumber: number) => {
        if (revelationFilter === 'all') return true;
        const surah = surahList.find(s => s.number === surahNumber);
        return surah ? surah.revelationType === revelationFilter : true;
    };

    const deduped: Record<string, any> = {};
    allMatches.forEach(m => {
        const key = `${m.surah.number}:${m.numberInSurah}`;
        if (!filterByJuz(m.surah.number) || !filterByRevelation(m.surah.number)) return;
        if (!deduped[key]) deduped[key] = m;
    });

    const finalMatches = Object.values(deduped);
    setSearchResults({ matches: finalMatches, count: finalMatches.length });
    setSearchError(localError || (finalMatches.length === 0 ? t.noMatches : null));
    setIsSearching(false);
  };

  const highlightText = (text: string, query: string) => {
    if(!query) return text;
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-900 text-black dark:text-white rounded px-0.5 font-bold">{part}</span> 
        : part
    );
  };

  const openTafsir = async (ayah: Ayah) => {
      const id = `${currentSurah?.number}:${ayah.numberInSurah}`;
      if (activeTafsir?.id === id) {
          setActiveTafsir(null);
          return;
      }

      if (ayah.tafsir) {
          setActiveTafsir({ id, text: ayah.tafsir });
          return;
      }

      setIsTafsirLoading(true);
      setActiveTafsir({ id, text: "" }); // placeholder
      // Pass Surah English name for context (e.g., for AI prompts)
      const text = await API.fetchTafsir(currentSurah!.number, ayah.numberInSurah, settings.tafsirIdentifier, currentSurah?.englishName);
      setActiveTafsir({ id, text: text || "Tafseer unavailable for this verse." });
      setIsTafsirLoading(false);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
  };

  const getArabicFontSize = () => {
      const sizes = ['text-xl leading-loose', 'text-2xl leading-[3rem]', 'text-3xl leading-[4rem]', 'text-4xl leading-[5rem]', 'text-5xl leading-[6rem]'];
      return sizes[settings.arabicFontSize - 1];
  };

  const getTranslationFontSize = () => {
      const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
      return sizes[settings.translationFontSize - 1];
  };

  const getTafsirFontSize = () => {
      const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
      const idx = (settings.tafsirFontSize || 3) - 1;
      return sizes[Math.max(0, Math.min(4, idx))];
  };

  const getTranslationFonts = () => {
      const currentTranslation = translations.find(tr => tr.identifier === settings.translationIdentifier);
      const lang = currentTranslation?.language || settings.uiLanguage;
      if (lang === 'fa') {
          return FONTS_TRANS.filter(f => f.id !== 'font-sans');
      }
      if (lang === 'ar') {
          return FONTS_TRANS.filter(f => f.id !== 'font-persian');
      }
      return FONTS_TRANS;
  };
  
  const getDisplayedReciters = () => {
      if (reciterMode === 'all') return reciters;
      const curated = reciters.filter(r => RECOMMENDED_RECITER_IDS.includes(r.identifier));
      if (curated.length) return curated;
      return reciters.slice(0, 25);
  };
  
  const getTafsirFonts = () => getTranslationFonts();
  
  const getSortedTranslations = (list: Edition[]) => {
      return [...list].sort((a, b) => {
          const aMatch = a.language === settings.uiLanguage;
          const bMatch = b.language === settings.uiLanguage;
          
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          
          return a.name.localeCompare(b.name);
      });
  };
  
  const handleJuzClick = (juzNum: number) => {
      setSelectedJuz(juzNum);
      const startSurahIndex = (JUZ_MAPPING[juzNum] || 1);
      const endSurahIndex = (JUZ_MAPPING[juzNum + 1] || 115);
      
      const juzSurahs = surahList.filter(s => s.number >= startSurahIndex && s.number < endSurahIndex);
      setFilteredSurahs(juzSurahs);
      setBrowseMode('surah'); // Switch back to list view to show results
  };

  // --- Render Functions (Hoisted) ---

  const renderPlayer = () => {
    const isVisible = isPlaying || isPlayerVisible;
    if (!isVisible) return null;

    return (
      <div className={`fixed z-50 left-1/2 -translate-x-1/2 w-[96%] max-w-3xl md:w-[600px] 
        bottom-4 md:bottom-10 
        bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 
        transition-all duration-300 transform 
        ${!isPlayerVisible ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`}
     >
         <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-dark-800 rounded-t-2xl overflow-hidden">
             <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: currentSurah && currentSurah?.ayahs && currentSurah.ayahs.length > 0 ? `${((currentAyahIndex + 1) / currentSurah.ayahs.length) * 100}%` : '100%' }}></div>
         </div>

         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button onClick={() => setIsPlayerVisible(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={16} />
               </button>
               <div className="text-sm">
                   <p className="font-bold text-slate-800 dark:text-slate-100 font-arabic line-clamp-1">{currentSurah?.name || "Audio"}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Ayah {currentSurah?.ayahs?.[currentAyahIndex]?.numberInSurah || 1}</p>
               </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button onClick={() => playAyah(currentAyahIndex - 1)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30">
                    <SkipBack size={20} className={isRTL ? "rotate-180" : ""} />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={() => playAyah(currentAyahIndex + 1)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30">
                    <SkipForward size={20} className={isRTL ? "rotate-180" : ""} />
                </button>
            </div>

            <div className="flex items-center gap-1">
                 <button onClick={toggleSpeed} className="hidden md:flex text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100 dark:bg-dark-800 rounded hover:bg-slate-200 w-12 justify-center">
                    {playbackRate}x
                 </button>
                 <div className="flex flex-col gap-1">
                    <button onClick={() => setAutoScroll(!autoScroll)} className={`text-[10px] px-2 py-1 rounded border ${autoScroll ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-slate-200 text-slate-500'}`}>
                        {t.scroll}
                    </button>
                    <button onClick={() => setIsAutoPlay(!isAutoPlay)} className={`text-[10px] px-2 py-1 rounded border ${isAutoPlay ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-slate-200 text-slate-500'}`}>
                        {t.auto}
                    </button>
                 </div>
            </div>
         </div>
         <audio 
            ref={audioRef} 
            src={audioUrl || ""} 
            onEnded={handleAyahEnd} 
            className="hidden" 
            onError={() => {
                console.log("Audio Error, skipping"); 
                if(isAutoPlay && currentSurah && currentSurah.ayahs && currentSurah.ayahs.length > 1) playAyah(currentAyahIndex + 1);
            }} 
         />
      </div>
    );
  };

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-lg shadow-primary-500/30">
                    <BookOpen size={24} />
                </div>
                <div>
                   <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-slate-800 dark:from-primary-400 dark:to-slate-200">Quran Ilya</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full text-slate-600 dark:text-slate-400">
                    {settings.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                 </button>
            </div>
        </header>
        
        {isOffline && (
            <div className={`mb-6 rounded-2xl border p-4 ${offlineSurahs.length ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50'}`}>
                <div className="flex items-start gap-3">
                    <Wifi className={offlineSurahs.length ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'} size={20} />
                    <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.offlineMode}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{offlineSurahs.length ? t.offlineReady : t.offlineMissing}</p>
                    </div>
                    {!offlineSurahs.length && (
                        <button onClick={() => setView('DOWNLOADS')} className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg dark:bg-primary-600 dark:hover:bg-primary-500 hover:bg-slate-700 transition-colors">
                            {t.goToDownloads}
                        </button>
                    )}
                </div>
            </div>
        )}

        {lastRead && (
             <div onClick={() => handleSurahClick(lastRead.surah.number)} className="mb-4 cursor-pointer group">
                  <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden flex items-center justify-between hover:shadow-md transition-all">
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-primary-500"></div>
                      <div className="z-10">
                          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">{t.continueReading}</p>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-arabic">{lastRead.surah.name}</h3>
                          <div className="flex gap-3 text-sm text-slate-500 dark:text-slate-400">
                             <span>Ayah {lastRead.ayahNumber}</span>
                             {lastRead.juzNumber && <span>• Juz {lastRead.juzNumber}</span>}
                          </div>
                      </div>
                      <div className="bg-primary-50 dark:bg-dark-700 p-3 rounded-full text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                          <ChevronRight size={20} className={isRTL ? "rotate-180" : ""} />
                      </div>
                  </div>
             </div>
        )}
        
        {juzProgress.length > 0 && selectedJuz && (
             <div className="mb-8 cursor-pointer" onClick={() => handleJuzClick(selectedJuz)}>
                 <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-5 shadow-lg text-white">
                     <div className="flex justify-between items-center mb-2">
                         <h3 className="font-bold">{t.continueJuz} {selectedJuz}</h3>
                         <span className="text-xs bg-white/20 px-2 py-1 rounded">Resume</span>
                     </div>
                     <p className="text-sm opacity-90">Pick up where you left off in Part {selectedJuz}</p>
                 </div>
             </div>
        )}

        {settings.onboardingComplete && settings.showDailyVerse && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-amber-500" size={20} />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.dailyVerse}</h2>
              </div>
              
              <div className="relative group overflow-hidden rounded-3xl shadow-xl shadow-primary-900/10 dark:shadow-black/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800"></div>
                  
                  <div className="relative p-6 md:p-8 text-white">
                      {isDailyVerseLoading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
                          <div className="h-8 bg-white/20 rounded w-1/3 mx-auto mt-4"></div>
                        </div>
                      ) : dailyVerse ? (
                        <div className="text-center">
                            <p className={`font-arabic text-2xl md:text-3xl mb-6 leading-relaxed drop-shadow-md ${settings.arabicFont}`} dir="rtl">{dailyVerse.text}</p>
                            <p className={`text-primary-100 text-sm md:text-base italic mb-6 leading-relaxed ${settings.translationFont}`}>{dailyVerse.translation}</p>
                            <div className="flex justify-center items-center gap-4">
                                <div className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                    {dailyVerse.surah.name} • Ayah {dailyVerse.numberInSurah}
                                </div>
                                <button 
                                  onClick={(e) => { 
                                      e.stopPropagation(); 
                                      playAyah(0, dailyVerse.audio, dailyVerse); 
                                      setIsPlayingBismillah(false); 
                                  }}
                                  className="w-10 h-10 bg-white text-primary-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                >
                                    <Play size={18} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 opacity-80">
                            <p>Verse currently unavailable. Check connection.</p>
                        </div>
                      )}
                  </div>
              </div>
            </div>
        )}

        <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.themes}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {THEMES.map(theme => (
                    <div 
                      key={theme.id}
                      onClick={() => {
                          const surahObjects = surahList.filter(s => theme.surahIds.includes(s.number));
                          setFilteredSurahs(surahObjects);
                          setBrowseMode('surah');
                          window.scrollTo({ top: document.getElementById('surah-grid')?.offsetTop || 0, behavior: 'smooth' });
                      }}
                      className="snap-start min-w-[140px] h-[180px] rounded-2xl relative overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all"
                    >
                        <img src={theme.imageUrl} alt={theme.id} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <span className="absolute bottom-4 left-4 right-4 text-white font-bold text-sm leading-tight">
                            {t[theme.titleKey] || theme.id}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div id="surah-grid">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setBrowseMode('surah')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${browseMode === 'surah' ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <div className="flex items-center gap-2"><List size={16}/> {t.viewSurah}</div>
                    </button>
                    <button 
                        onClick={() => setBrowseMode('juz')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${browseMode === 'juz' ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <div className="flex items-center gap-2"><Grid size={16}/> {t.viewJuz}</div>
                    </button>
                </div>
                
                {browseMode === 'surah' && (
                    <div className="flex gap-2">
                        <button onClick={() => { setFilteredSurahs(surahList); setSelectedJuz(null); }} className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-dark-800 px-5 py-2 rounded-full hover:bg-primary-100 dark:hover:bg-dark-700 transition-colors">{t.all}</button>
                    </div>
                )}
            </div>
            
            {browseMode === 'juz' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => (
                        <div 
                            key={juzNum}
                            onClick={() => handleJuzClick(juzNum)}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer flex flex-col items-center justify-center gap-2 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                                {juzNum}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{t.juz} {juzNum}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                      Array.from({length: 9}).map((_, i) => <SurahSkeleton key={i} />)
                  ) : (
                      filteredSurahs.map(surah => (
                        <div key={surah.number} 
                            onClick={() => handleSurahClick(surah.number)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-dark-700 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors relative">
                                        {surah.number}
                                        <div className="absolute inset-0 border-2 border-slate-100 dark:border-dark-600 rounded-xl group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-colors"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-arabic text-lg">{surah.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{surah.englishName}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{surah.revelationType === 'Meccan' ? t.meccan : t.medinan}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{surah.numberOfAyahs} ayahs</p>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <IconButton 
                                            icon={Bookmark} 
                                            onClick={() => toggleBookmark(surah)} 
                                            active={bookmarks.some(b => b.id === `surah_${surah.number}`)}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-700" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))
                  )}
                </div>
            )}
        </div>
    </div>
  );

  // 2. Surah Reader View
  if (view === 'SURAH') {
    if (isSurahLoading) return <SurahReaderSkeleton />;
    if (surahError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{t.errorLoading}</h2>
                <button 
                  onClick={() => handleSurahClick(currentSurah?.number || 1)} 
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                >
                    {t.retry}
                </button>
            </div>
        );
    }
    
    if (currentSurah) {
      return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-950 relative">
          
          {/* Settings Modal */}
          {showQuickSettings && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowQuickSettings(false)}>
                <div className={`bg-white dark:bg-dark-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 ${settings.appFont || ''}`} onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">{t.appearance}</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">{t.arabicSize}</label>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 rounded-xl p-1.5">
                                <button onClick={() => setSettings(s => ({...s, arabicFontSize: Math.max(1, s.arabicFontSize - 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Minus size={18}/></button>
                                <span className="text-lg font-bold w-8 text-center text-slate-700 dark:text-slate-300">{settings.arabicFontSize}</span>
                                <button onClick={() => setSettings(s => ({...s, arabicFontSize: Math.min(5, s.arabicFontSize + 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Plus size={18}/></button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">{t.transSize}</label>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 rounded-xl p-1.5">
                                <button onClick={() => setSettings(s => ({...s, translationFontSize: Math.max(1, s.translationFontSize - 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Minus size={18}/></button>
                                <span className="text-lg font-bold w-8 text-center text-slate-700 dark:text-slate-300">{settings.translationFontSize}</span>
                                <button onClick={() => setSettings(s => ({...s, translationFontSize: Math.min(5, s.translationFontSize + 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Plus size={18}/></button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">{t.tafsir}</label>
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 rounded-xl p-1.5">
                                <button onClick={() => setSettings(s => ({...s, tafsirFontSize: Math.max(1, (s.tafsirFontSize || 3) - 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Minus size={18}/></button>
                                <span className="text-lg font-bold w-8 text-center text-slate-700 dark:text-slate-300">{settings.tafsirFontSize || 3}</span>
                                <button onClick={() => setSettings(s => ({...s, tafsirFontSize: Math.min(5, (s.tafsirFontSize || 3) + 1)}))} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg shadow-sm transition-colors"><Plus size={18}/></button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowQuickSettings(false)} className="mt-8 w-full py-3 bg-primary-600 text-white rounded-xl font-bold">{t.close}</button>
                </div>
             </div>
          )}

          <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
            <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto w-full">
                <IconButton icon={ArrowLeft} onClick={() => { setView('HOME'); setIsPlaying(false); }} className={isRTL ? "rotate-180" : ""} />
                
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-arabic">{currentSurah.name}</h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                      <span>{currentSurah.englishName}</span>
                      <span>•</span>
                      <span>{currentSurah.numberOfAyahs} Ayahs</span>
                      <span>•</span>
                      <span className="bg-slate-100 dark:bg-dark-800 px-1.5 rounded">{t.juz}: {currentSurah.ayahs[0]?.juz || 1}</span>
                  </div>
                </div>

                <div className="relative flex items-center gap-1">
                  <div className="relative">
                      <IconButton 
                          icon={offlineSurahs.some(s => s.number === currentSurah.number) ? (offlineSurahs.find(s=>s.number===currentSurah.number)?.hasAudio ? CheckCircle : Check) : Download} 
                          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                          className={offlineSurahs.some(s => s.number === currentSurah.number) ? "text-green-600 dark:text-green-400" : ""} 
                      />
                      {showDownloadMenu && (
                          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                              <button onClick={() => downloadCurrentSurah(false, false)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-dark-700 border-b border-slate-100 dark:border-slate-700">
                                  {t.downloadText}
                              </button>
                              <button onClick={() => downloadCurrentSurah(false, true)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-dark-700 border-b border-slate-100 dark:border-slate-700">
                                  {t.downloadTextTafsir}
                              </button>
                              <button onClick={() => downloadCurrentSurah(true, false)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-dark-700 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                  {t.downloadAudio}
                                  <Music size={14} className="text-slate-400"/>
                              </button>
                              <button onClick={() => downloadCurrentSurah(true, true)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-dark-700 flex items-center justify-between">
                                  {t.downloadFull}
                                  <Layers size={14} className="text-slate-400"/>
                              </button>
                          </div>
                      )}
                      {showDownloadMenu && <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)}></div>}
                  </div>
                  <IconButton icon={Type} active={showQuickSettings} onClick={() => setShowQuickSettings(true)} />
                </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 scroll-smooth" id="reader-container">
              <div className="max-w-4xl mx-auto space-y-6 pb-40">
                  {currentSurah.number !== 1 && currentSurah.number !== 9 && (
                      <div className="text-center py-8 mb-4 relative">
                          <div className={`text-3xl md:text-4xl text-slate-800 dark:text-slate-200 opacity-90 leading-relaxed ${settings.arabicFont}`}>
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                          </div>
                      </div>
                  )}

                  {currentSurah.ayahs.map((ayah, index) => (
                      <div 
                          key={ayah.number} 
                          id={`ayah-${index}`}
                          className={`p-6 rounded-2xl transition-all duration-300 relative group border ${currentAyahIndex === index ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800 shadow-md ring-1 ring-primary-100 dark:ring-primary-900' : 'bg-white border-transparent hover:border-slate-100 dark:bg-dark-900 dark:border-slate-800 dark:hover:border-slate-700'}`}
                      >
                          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                                  {ayah.numberInSurah}
                              </span>
                              
                              <div className="flex items-center gap-1 pl-3 border-l border-slate-100 dark:border-slate-800">
                                  <IconButton icon={Play} onClick={() => playAyah(index)} className="text-slate-400 hover:text-primary-600" />
                                  <IconButton icon={Bookmark} onClick={() => toggleBookmark(currentSurah, ayah)} active={bookmarks.some(b => b.id === `${currentSurah.number}:${ayah.numberInSurah}`)} />
                                  <IconButton icon={Book} onClick={() => openTafsir(ayah)} className={activeTafsir?.id === `${currentSurah.number}:${ayah.numberInSurah}` ? 'text-blue-500' : 'text-slate-400'} />
                              </div>
                          </div>

                          <p className={`text-right mb-6 text-slate-800 dark:text-slate-100 ${settings.arabicFont} ${getArabicFontSize()}`} dir="rtl">
                              {ayah.text}
                          </p>

                          <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${settings.translationFont} ${getTranslationFontSize()} ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                              {ayah.translation}
                          </p>
                          
                          {/* Traditional Tafsir Box */}
                          {activeTafsir?.id === `${currentSurah.number}:${ayah.numberInSurah}` && (
                              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-fade-in">
                                  <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                                      <Book size={14} /> {t.tafsir}
                                  </div>
                                  {isTafsirLoading && !activeTafsir.text ? (
                                      <div className="flex items-center gap-2 text-sm text-slate-500">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                          {t.loadingTafsir}
                                      </div>
                                  ) : (
                                      <div className={`text-slate-700 dark:text-slate-300 leading-relaxed ${isRTL ? 'text-right' : 'text-left'} ${settings.tafsirFont || ''} ${getTafsirFontSize()}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                          {activeTafsir.text}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
          {renderPlayer()}
        </div>
      );
    }
  }

  return (
      <div className={`h-full flex flex-col ${settings.uiLanguage === 'fa' || settings.uiLanguage === 'ar' ? 'font-arabic' : 'font-sans'} ${settings.appFont || ''}`}>
      
      {!settings.onboardingComplete && !isLoading && (
          <Onboarding 
            settings={settings} 
            setSettings={setSettings} 
            translations={translations}
            reciters={reciters}
            tafsirs={tafsirs}
            t={t}
            onComplete={() => {
                setSettings(s => ({...s, onboardingComplete: true}));
                window.location.reload(); 
            }}
          />
      )}

      <div className="flex-1 overflow-y-auto pb-20">
         {view === 'HOME' && renderHome()}
         {view === 'SURAH' && null}
         
         {view === 'DOWNLOADS' && (
             <div className="max-w-4xl mx-auto p-4 pt-8 pb-32">
                 <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{t.downloads}</h2>
                 
                {offlineMetadata && (offlineMetadata.reciterId !== settings.reciterIdentifier || offlineMetadata.translationId !== settings.translationIdentifier || (offlineMetadata.tafsirId && offlineMetadata.tafsirId !== settings.tafsirIdentifier)) && (
                     <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-xl mb-6 flex items-start gap-4">
                         <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                             <RefreshCw size={24} />
                         </div>
                         <div className="flex-1">
                             <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1">{t.dataMismatch}</h3>
                             <p className="text-sm text-amber-700 dark:text-amber-400/80 mb-3">Settings changed. Sync to get correct audio/text/tafsir.</p>
                             <button onClick={handleUpdateData} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-amber-700 transition-colors">
                                 {t.syncData}
                             </button>
                         </div>
                     </div>
                 )}

                 <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                     <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                             <Database className="text-primary-600 dark:text-primary-400" size={28} />
                             <div>
                                 <h3 className="font-bold text-lg">{t.downloadManager}</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{offlineSurahs.length} / 114 Surahs</p>
                             </div>
                         </div>
                         {offlineMetadata && (
                             <div className="text-right">
                                 <p className="text-xs text-slate-500">{t.storageUsed}</p>
                                 <p className="font-bold text-sm">~{(offlineSurahs.length * ((includeAudio ? 5.5 : 0.2) + (includeTafsir ? 0.15 : 0))).toFixed(1)} MB</p>
                             </div>
                         )}
                     </div>

                     <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 p-3 rounded-xl mb-6">
                         <div className="flex items-center gap-3">
                             <Headphones className={includeAudio ? "text-primary-600" : "text-slate-400"} size={20} />
                             <span className="text-sm font-medium">{t.includeAudio}</span>
                         </div>
                         <button 
                            onClick={() => setIncludeAudio(!includeAudio)} 
                            className={`w-12 h-6 rounded-full relative transition-colors ${includeAudio ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                         >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeAudio ? 'left-7' : 'left-1'}`}></div>
                         </button>
                     </div>
                     
                     <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900 p-3 rounded-xl mb-6">
                         <div className="flex items-center gap-3">
                             <Book className={includeTafsir ? "text-primary-600" : "text-slate-400"} size={20} />
                             <span className="text-sm font-medium">{t.includeTafsir}</span>
                         </div>
                         <button 
                            onClick={() => setIncludeTafsir(!includeTafsir)} 
                            className={`w-12 h-6 rounded-full relative transition-colors ${includeTafsir ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                         >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeTafsir ? 'left-7' : 'left-1'}`}></div>
                         </button>
                     </div>
                     
                     {includeTafsir && (
                         <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-6">
                             <AlertTriangle size={16} />
                             <p>{t.tafsirSizeWarning}</p>
                         </div>
                     )}
                     
                     {includeAudio && (
                         <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-6">
                             <AlertTriangle size={16} />
                             <p>{t.audioSizeWarning}</p>
                         </div>
                     )}

                     <div className="w-full bg-slate-100 dark:bg-dark-900 rounded-full h-3 mb-2 overflow-hidden flex">
                         <div 
                            className={`h-full transition-all duration-300 relative ${isDownloadingAll && downloadStatus === t.cancelled ? 'bg-red-500' : 'bg-primary-600'}`}
                            style={{ width: isDownloadingAll ? `${downloadProgress}%` : `${(offlineSurahs.length / 114) * 100}%` }}
                         >
                            {isDownloadingAll && downloadStatus !== t.cancelled && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                         </div>
                     </div>
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-xs text-slate-500">
                            {isDownloadingAll ? `${downloadStatus} (${downloadProgress}%)` : `${Math.round((offlineSurahs.length / 114) * 100)}% Complete`}
                        </p>
                        {isDownloadingAll && (
                            <button onClick={cancelDownload} className="text-red-500 hover:text-red-600 p-1 bg-red-50 dark:bg-red-900/20 rounded">
                                <XSquare size={20} />
                            </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                         <button 
                             onClick={handleBulkDownload}
                             disabled={isDownloadingAll}
                             className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isDownloadingAll ? 'bg-slate-100 text-slate-400' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'}`}
                         >
                             {isDownloadingAll ? (
                                 <><RefreshCw className="animate-spin" size={18} /> {t.downloading}</>
                             ) : (
                                 <><Download size={18} /> {isSelectionMode && selectedSurahs.size > 0 ? `${t.downloadSelected} (${selectedSurahs.size})` : t.downloadAll}</>
                             )}
                         </button>
                         <button 
                             onClick={handleDeleteAll}
                             disabled={offlineSurahs.length === 0 || isDownloadingAll}
                             className="py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                         >
                             <Trash2 size={18} /> {t.deleteData}
                         </button>
                     </div>

                     <button onClick={() => setIsSelectionMode(!isSelectionMode)} className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                         {isSelectionMode ? t.close : t.manageDownloads}
                     </button>
                 </div>

                 {isSelectionMode ? (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                         <div className="flex justify-between items-center bg-slate-50 dark:bg-dark-900/50 p-3 rounded-xl">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">{t.selectSurahs}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedSurahs(new Set(surahList.map(s => s.number)))} className="text-xs px-2 py-1 bg-white dark:bg-dark-800 rounded shadow-sm">{t.selectAll}</button>
                                <button onClick={() => setSelectedSurahs(new Set())} className="text-xs px-2 py-1 bg-white dark:bg-dark-800 rounded shadow-sm">{t.deselectAll}</button>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {surahList.map(s => (
                                 <div 
                                    key={s.number} 
                                    onClick={() => toggleSurahSelection(s.number)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${selectedSurahs.has(s.number) ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20' : 'bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700'}`}
                                 >
                                     <div className="flex items-center gap-3">
                                         {selectedSurahs.has(s.number) ? <CheckSquare className="text-primary-600" /> : <Square className="text-slate-400" />}
                                         <div>
                                             <span className={`font-bold text-sm ${isRTL ? settings.arabicFont : ''}`}>{(isRTL || settings.uiLanguage === 'ar') ? s.name : s.englishName}</span>
                                             <span className="text-xs text-slate-400 ml-2">#{s.number}</span>
                                         </div>
                                     </div>
                                     {offlineSurahs.some(d => d.number === s.number) && <CheckCircle size={16} className="text-green-500" />}
                                 </div>
                             ))}
                         </div>
                     </div>
                 ) : (
                     <>
                        <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-100">{t.downloaded}</h3>
                        {offlineSurahs.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                <Download size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">{t.noDownloads}</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {offlineSurahs.map((d: any) => (
                                    <div key={d.number} onClick={() => handleSurahClick(d.number)} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-primary-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center relative">
                                                <CheckCircle size={20} />
                                                {d.hasAudio && <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-0.5"><Music size={10} /></div>}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${isRTL ? settings.arabicFont : ''}`}>{(isRTL || settings.uiLanguage === 'ar') ? d.name : d.englishName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-500">{new Date(d.downloadedAt).toLocaleDateString()}</p>
                                                    {d.hasAudio ? (
                                                        <span className="text-[10px] bg-slate-100 dark:bg-dark-900 px-1 rounded text-slate-500">Audio + Text</span>
                                                    ) : (
                                                        <span className="text-[10px] bg-slate-100 dark:bg-dark-900 px-1 rounded text-slate-500">Text Only</span>
                                                    )}
                                                    {d.tafsirId && (
                                                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 px-1 rounded text-blue-600 dark:text-blue-300">{t.tafsir}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {!d.hasAudio && (
                                                <button onClick={(e) => { e.stopPropagation(); downloadAudioOnly(d.number); }} className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400" title={t.downloadAudioOnly}>
                                                    <Mic size={18} />
                                                </button>
                                            )}
                                            <ChevronRight size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </>
                 )}
             </div>
         )}
         
         {view === 'SEARCH' && (
             <div className="max-w-4xl mx-auto p-4 pt-8">
                 <div className="flex items-center gap-2 mb-6 bg-white dark:bg-dark-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                     <Search className="text-slate-400 ml-2" />
                     <input 
                       className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg p-2 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-100"
                       placeholder={t.searchPlaceholder}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                       autoFocus
                     />
                     {searchQuery && <button onClick={() => setSearchQuery("")} className="p-2 text-slate-400 hover:text-slate-600"><X size={18}/></button>}
                     <button onClick={() => handleSearch()} className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary-700 whitespace-nowrap">
                         {t.search}
                     </button>
                 </div>
                 
                 {/* Popular Topics */}
                 <div className="mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t.popularTopics}</p>
                    <div className="flex flex-wrap gap-2">
                        {(POPULAR_TOPICS[settings.uiLanguage] || POPULAR_TOPICS.en).map(topic => (
                            <button 
                                key={topic}
                                onClick={() => handleSearch(topic)}
                                className="px-3 py-1.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        {id: 'translation', label: t.searchTranslation},
                        {id: 'arabic', label: t.searchArabic},
                        {id: 'tafsir', label: t.searchTafsir},
                        {id: 'surah', label: t.searchSurahName},
                        {id: 'ayah', label: t.searchAyah}
                    ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleSearchMode(opt.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${searchModes.has(opt.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                        >
                          {opt.label}
                        </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <List className="text-slate-400" size={18} />
                        <select 
                          className="flex-1 p-2 rounded-lg border bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700"
                          value={searchJuzFilter || ''}
                          onChange={(e) => setSearchJuzFilter(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">{t.searchJuz}</option>
                            {Array.from({length: 30}, (_, i) => i + 1).map(j => <option key={j} value={j}>{t.juz} {j}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Compass className="text-slate-400" size={18} />
                        <select 
                          className="flex-1 p-2 rounded-lg border bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700"
                          value={revelationFilter}
                          onChange={(e) => setRevelationFilter(e.target.value as any)}
                        >
                            <option value="all">{t.revelationFilter}</option>
                            <option value="Meccan">{t.meccan}</option>
                            <option value="Medinan">{t.medinan}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="text-slate-400" size={18} />
                        <button 
                          onClick={() => { 
                              setSearchModes(new Set(['translation', 'arabic', 'surah'])); 
                              setSearchJuzFilter(null); 
                              setRevelationFilter('all'); 
                              setSearchError(null);
                          }} 
                          className="flex-1 p-2 rounded-lg border bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700 text-sm"
                        >
                          {t.resetFilters}
                        </button>
                    </div>
                 </div>

                 {isSearching ? <LoadingSpinner /> : (
                     <div className="space-y-4">
                         {searchResults?.matches?.map((match: any, i: number) => (
                             <div key={i} onClick={() => handleSurahClick(match.surah.number)} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary-200 group">
                                 <div className="flex justify-between mb-2">
                                     <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                         {match.surah.englishName} : {match.numberInSurah}
                                     </span>
                                     {match._source && (
                                        <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-500">
                                            {match._source}
                                        </span>
                                     )}
                                 </div>
                                 <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm break-words">
                                     {highlightText(match.text, searchQuery)}
                                 </p>
                             </div>
                         ))}
                         {searchError && (
                             <div className="text-center text-slate-500 mt-10">{searchError}</div>
                         )}
                     </div>
                 )}
             </div>
         )}

         {view === 'SETTINGS' && (
             <div className="max-w-4xl mx-auto p-4 pt-8 pb-32">
                 <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{t.settings}</h2>
                 
                 <div className="space-y-6">
                     <section className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><LayoutTemplate size={18}/> {t.appearance}</h3>
                         <div className="flex items-center justify-between mb-6">
                             <span className="text-sm text-slate-600 dark:text-slate-400">Dark Mode</span>
                             <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors relative ${settings.theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200'}`}>
                                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                             </button>
                         </div>
                         
                         <div className="mb-6 space-y-3">
                             <div>
                                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t.appFontSize}</label>
                                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-dark-900 p-2 rounded-xl">
                                     <button onClick={() => setSettings(s => ({...s, uiFontSize: Math.max(1, s.uiFontSize - 1)}))} className="w-10 h-10 rounded-lg bg-white dark:bg-dark-800 shadow-sm flex items-center justify-center hover:text-primary-600"><Minus size={18}/></button>
                                     <div className="flex-1 text-center">
                                         <div className="flex justify-center gap-1">
                                             {[1, 2, 3, 4, 5].map(dot => (
                                                 <div key={dot} className={`h-1.5 rounded-full transition-all ${dot <= settings.uiFontSize ? 'w-4 bg-primary-500' : 'w-1.5 bg-slate-300 dark:bg-dark-600'}`}></div>
                                             ))}
                                         </div>
                                     </div>
                                     <button onClick={() => setSettings(s => ({...s, uiFontSize: Math.min(5, s.uiFontSize + 1)}))} className="w-10 h-10 rounded-lg bg-white dark:bg-dark-800 shadow-sm flex items-center justify-center hover:text-primary-600"><Plus size={18}/></button>
                                </div>
                             </div>
                             <div>
                                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t.appFont}</label>
                                 <div className="flex flex-wrap gap-2">
                                    {APP_FONTS.map(f => (
                                        <button 
                                          key={f.id}
                                          onClick={() => setSettings(s => ({...s, appFont: f.id}))}
                                          className={`px-3 py-1.5 rounded-lg text-sm border ${settings.appFont === f.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400'}`}
                                        >
                                          {f.label}
                                        </button>
                                    ))}
                                 </div>
                             </div>
                         </div>
                         
                         {/* Live Preview Box */}
                         <div className="bg-slate-50 dark:bg-dark-900 p-5 rounded-xl border border-slate-100 dark:border-slate-700 mb-6 space-y-4">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t.preview}</p>
                            <div className="text-center space-y-2">
                                <p className={`${settings.arabicFont} ${getArabicFontSize()} text-slate-800 dark:text-slate-100 leading-loose`} dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                                <p className={`${settings.translationFont} ${getTranslationFontSize()} text-slate-600 dark:text-slate-400`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    {isRTL ? 'به نام خداوند بخشنده مهربان' : 'In the name of God, the Most Gracious, the Most Merciful'}
                                </p>
                                <p className={`${settings.tafsirFont || ''} ${getTafsirFontSize()} text-slate-700 dark:text-slate-300`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    {isRTL ? 'پیش‌نمایش متن تفسیر با فونت و اندازه انتخابی' : 'Preview tafsir text with chosen font and size'}
                                </p>
                            </div>
                         </div>
                         
                        <div className="space-y-6">
                            {/* Arabic Settings */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.arabicFont}</label>
                                 </div>
                                 <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-3">
                                     {FONTS_ARABIC.map(f => (
                                         <button 
                                            key={f.id}
                                            onClick={() => setSettings(s => ({...s, arabicFont: f.id}))}
                                            className={`px-3 py-1.5 rounded-lg text-sm border ${settings.arabicFont === f.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400'}`}
                                         >
                                            {f.label}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Translation Settings */}
                             <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                 <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.transFont}</label>
                                 </div>
                                 <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-3">
                                     {getTranslationFonts().map(f => (
                                         <button 
                                            key={f.id}
                                            onClick={() => setSettings(s => ({...s, translationFont: f.id}))}
                                            className={`px-3 py-1.5 rounded-lg text-sm border ${settings.translationFont === f.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400'}`}
                                         >
                                            {f.label}
                                         </button>
                                     ))}
                                 </div>
                                 <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-3">
                                     {getTafsirFonts().map(f => (
                                         <button 
                                            key={`tafsir-${f.id}`}
                                            onClick={() => setSettings(s => ({...s, tafsirFont: f.id}))}
                                            className={`px-3 py-1.5 rounded-lg text-xs border ${settings.tafsirFont === f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400'}`}
                                         >
                                            {t.tafsirFontLabel}: {f.label}
                                         </button>
                                     ))}
                                 </div>
                                 <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">{t.preview}</p>
                                    <p className={`text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${settings.tafsirFont || ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                        {isRTL ? 'پیش‌نمایش متن تفسیر با فونت انتخابی' : 'Preview tafsir text with the selected font'}
                                    </p>
                                 </div>
                             </div>
                         </div>
                     </section>

                     <section className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Volume2 size={18}/> {t.audioSettings}</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{t.playBismillah}</span>
                            <button onClick={() => setSettings(s => ({...s, playBismillah: !s.playBismillah}))} className={`w-12 h-6 rounded-full transition-colors relative ${settings.playBismillah ? 'bg-primary-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.playBismillah ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{t.showDailyVerse}</span>
                            <button onClick={() => setSettings(s => ({...s, showDailyVerse: !s.showDailyVerse}))} className={`w-12 h-6 rounded-full transition-colors relative ${settings.showDailyVerse ? 'bg-primary-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.showDailyVerse ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="mb-4">
                           <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">{t.selectReciter}</label>
                           <div className="flex items-center gap-2 mb-2">
                               <button 
                                  onClick={() => setReciterMode('recommended')} 
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${reciterMode === 'recommended' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                               >
                                   {t.reciterModeRecommended}
                               </button>
                               <button 
                                  onClick={() => setReciterMode('all')} 
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${reciterMode === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                               >
                                   {t.reciterModeAll}
                               </button>
                           </div>
                           <select 
                               className="w-full p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-600 rounded-lg"
                               value={settings.reciterIdentifier}
                               onChange={(e) => setSettings({...settings, reciterIdentifier: e.target.value})}
                           >
                               {(getDisplayedReciters().some(r => r.identifier === settings.reciterIdentifier) ? getDisplayedReciters() : [...getDisplayedReciters(), reciters.find(r => r.identifier === settings.reciterIdentifier)].filter(Boolean as any)).map(rec => <option key={(rec as any).identifier} value={(rec as any).identifier}>{(rec as any).name}</option>)}
                           </select>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">{t.defaultSpeed}</label>
                            <select 
                               className="w-full p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-600 rounded-lg"
                               value={settings.defaultPlaybackRate || 1}
                               onChange={(e) => { 
                                   const rate = parseFloat(e.target.value); 
                                   setSettings({...settings, defaultPlaybackRate: rate}); 
                                   setPlaybackRate(rate); 
                               }}
                            >
                               {[0.75,1,1.25,1.5,2].map(r => <option key={r} value={r}>{r}x</option>)}
                            </select>
                        </div>
                     </section>

                     <section className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Globe size={18}/> {t.selectLang}</h3>
                         <div className="grid grid-cols-2 gap-2 mb-4">
                             {LANGUAGES.map(lang => (
                                <button 
                                    key={lang.id}
                                    onClick={() => setSettings({...settings, uiLanguage: lang.id})}
                                    className={`flex items-center gap-2 p-2 rounded-lg border ${settings.uiLanguage === lang.id ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-600'}`}
                                >
                                    <span>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                             ))}
                         </div>
                         <div>
                            <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">{t.selectTrans}</label>
                            <select 
                                className="w-full p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-600 rounded-lg"
                                value={settings.translationIdentifier}
                                onChange={(e) => setSettings({...settings, translationIdentifier: e.target.value})}
                            >
                                {getSortedTranslations(translations).map(trans => (
                                  <option key={trans.identifier} value={trans.identifier}>
                                     {trans.name} ({trans.language.toUpperCase()})
                                  </option>
                                ))}
                            </select>
                         </div>
                         <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">{t.selectTafsir}</label>
                            <select 
                                className="w-full p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-600 rounded-lg"
                                value={settings.tafsirIdentifier}
                                onChange={(e) => setSettings({...settings, tafsirIdentifier: e.target.value})}
                            >
                                {tafsirs.length === 0 ? <option value="ar.jalalayn">Al-Jalalayn (Default)</option> : 
                                  tafsirs.map(tf => (
                                      <option key={tf.identifier} value={tf.identifier}>
                                          {tf.name} ({tf.language.toUpperCase()})
                                      </option>
                              ))
                            }
                            </select>
                         </div>
                     </section>
                     
                     <section className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2"><Star size={18}/> {t.rateApp}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t.rateAppDesc}</p>
                        <button 
                          onClick={requestRating} 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-sm transition-colors"
                        >
                            <Star size={16} fill="currentColor" /> {t.rateCta}
                        </button>
                     </section>

                     <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Code size={20}/> {t.aboutDev}</h3>
                            <p className="text-slate-300 text-sm mb-4">{t.devName}</p>
                            <p className="text-slate-300 text-xs mb-4">{t.devCredit}</p>
                            
                            <div className="flex gap-3">
                                <a href="https://github.com/mcodersir" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    <Github size={20} />
                                </a>
                                <a href="https://t.me/M_CODERir" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    <Send size={20} />
                                </a>
                                <a href="https://x.com/mcoderss" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    <Twitter size={20} />
                                </a>
                            </div>
                        </div>
                     </section>
                 </div>
             </div>
         )}
         
         {view === 'BOOKMARKS' && (
             <div className="max-w-4xl mx-auto p-4 pt-8">
                 <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{t.bookmarks}</h2>
                 {bookmarks.length === 0 ? (
                     <div className="text-center text-slate-500 mt-20">
                         <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                         <p>{t.noBookmarks}</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {bookmarks.map((b) => (
                             <div key={b.id} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                 <div className="flex justify-between items-start mb-2">
                                     <div onClick={() => handleSurahClick(b.surahNumber)} className="cursor-pointer hover:text-primary-600">
                                         <h4 className="font-bold text-lg">{b.surahName}</h4>
                                         <p className="text-xs text-slate-500">
                                            {b.ayahNumber ? `Ayah ${b.ayahNumber}` : 'Full Surah'} • {new Date(b.timestamp).toLocaleDateString()}
                                         </p>
                                     </div>
                                     <button onClick={() => toggleBookmark({ number: b.surahNumber, englishName: b.surahName } as any, b.ayahNumber ? { numberInSurah: b.ayahNumber } as any : undefined)} className="text-red-500 p-1">
                                         <Bookmark size={18} fill="currentColor" />
                                     </button>
                                 </div>
                                 
                                 {editingNoteId === b.id ? (
                                     <div className="mt-2">
                                         <textarea 
                                            className="w-full p-2 bg-slate-50 dark:bg-dark-900 rounded border border-slate-200 dark:border-slate-600 text-sm mb-2"
                                            value={noteInput}
                                            onChange={(e) => setNoteInput(e.target.value)}
                                            placeholder={t.notePlaceholder}
                                            autoFocus
                                         />
                                         <div className="flex gap-2 justify-end">
                                             <button onClick={() => setEditingNoteId(null)} className="text-xs px-3 py-1 text-slate-500">{t.cancel}</button>
                                             <button onClick={() => saveNote(b.id)} className="text-xs px-3 py-1 bg-primary-600 text-white rounded">{t.save}</button>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-900/50 p-3 rounded-lg flex justify-between group cursor-pointer" onClick={() => { setEditingNoteId(b.id); setNoteInput(b.note || ""); }}>
                                         <span>{b.note || t.notePlaceholder}</span>
                                         <Edit3 size={14} className="opacity-0 group-hover:opacity-50" />
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         )}

      </div>

      {showRatingDialog && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRatingDialog(false)}>
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <Star size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t.ratePromptTitle}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t.ratePromptBody}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowRatingDialog(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {t.rateLater}
                    </button>
                    <button onClick={openRatingPage} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-sm">
                        {t.rateConfirm}
                    </button>
                </div>
            </div>
        </div>
      )}

      <nav className="fixed bottom-0 z-40 w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 pb-2 pt-1 shadow-2xl transition-all md:bottom-8 md:left-1/2 md:w-[450px] md:-translate-x-1/2 md:rounded-3xl md:border md:pb-1">
          <div className="grid grid-cols-5 h-16 items-stretch">
              <button onClick={() => setView('DOWNLOADS')} className={`flex flex-col items-center justify-center gap-1 h-full w-full ${view === 'DOWNLOADS' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Download size={24} strokeWidth={view === 'DOWNLOADS' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{t.downloads}</span>
              </button>
              
              <button onClick={() => setView('SEARCH')} className={`flex flex-col items-center justify-center gap-1 h-full w-full ${view === 'SEARCH' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Search size={24} strokeWidth={view === 'SEARCH' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{t.search}</span>
              </button>

              <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-auto p-1.5 bg-slate-50 dark:bg-dark-950 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                      <button onClick={() => setView('HOME')} className={`w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${view === 'HOME' ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}>
                          <Home size={28} />
                      </button>
                  </div>
              </div>

              <button onClick={() => setView('BOOKMARKS')} className={`flex flex-col items-center justify-center gap-1 h-full w-full ${view === 'BOOKMARKS' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Bookmark size={24} strokeWidth={view === 'BOOKMARKS' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{t.bookmarks}</span>
              </button>

              <button onClick={() => setView('SETTINGS')} className={`flex flex-col items-center justify-center gap-1 h-full w-full ${view === 'SETTINGS' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Settings size={24} strokeWidth={view === 'SETTINGS' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{t.settings}</span>
              </button>
          </div>
      </nav>

      {renderPlayer()}
    </div>
  );
}
