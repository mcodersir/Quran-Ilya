
import { Surah, SurahDetail, Edition } from "../types";
import { get, set, del, keys, clear } from "idb-keyval";

const QURAN_API_BASE = "https://api.alquran.cloud/v1";

// --- Offline Storage Service (IndexedDB) ---

const METADATA_KEY = 'offline_metadata';

export interface OfflineMetadata {
    lastUpdated: number;
    translationId: string;
    reciterId: string;
    totalDownloaded: number;
    tafsirId?: string;
}

export const getOfflineMetadata = async (): Promise<OfflineMetadata | undefined> => {
    return await get(METADATA_KEY);
};

export const saveSurahOffline = async (surah: SurahDetail, translationId: string, reciterId: string, hasAudio: boolean = false, tafsirId?: string) => {
    try {
        await set(`surah_${surah.number}`, surah);
        
        // Update per-surah meta
        const existingMeta = await get(`surah_${surah.number}_meta`);
        
        await set(`surah_${surah.number}_meta`, {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            downloadedAt: Date.now(),
            translationId,
            reciterId,
            tafsirId: tafsirId || existingMeta?.tafsirId,
            hasAudio: hasAudio || (existingMeta?.hasAudio && existingMeta?.reciterId === reciterId)
        });

        return true;
    } catch (e) {
        console.error("Save Offline Error", e);
        return false;
    }
};

export const updateGlobalMetadata = async (count: number, translationId: string, reciterId: string, tafsirId?: string) => {
    await set(METADATA_KEY, {
        lastUpdated: Date.now(),
        translationId,
        reciterId,
        totalDownloaded: count,
        tafsirId
    });
};

export const getOfflineSurah = async (number: number): Promise<SurahDetail | undefined> => {
    return await get(`surah_${number}`);
};

export const getDownloadedSurahs = async () => {
    const allKeys = await keys();
    const metaKeys = allKeys.filter((k: any) => k.toString().endsWith('_meta'));
    const downloads = [];
    for (const key of metaKeys) {
        const data = await get(key);
        downloads.push(data);
    }
    return downloads.sort((a: any, b: any) => a.number - b.number);
};

export const clearAllDownloads = async () => {
    await clear();
    // Also clear audio cache
    if ('caches' in window) {
        await caches.delete('quran-audio-cache');
    }
};

export const clearOfflineAudio = async () => {
    // Keeps text, removes audio files
    if ('caches' in window) {
        await caches.delete('quran-audio-cache');
    }
    const downloads = await getDownloadedSurahs();
    for(const d of downloads) {
        await set(`surah_${d.number}_meta`, { ...d, hasAudio: false });
    }
}

// --- Notification Service ---

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
    }
};

// --- Audio Caching Service ---

const fetchAudioWithRetry = async (url: string, signal?: AbortSignal, retries = 3): Promise<Response | null> => {
    for (let i = 0; i < retries; i++) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        try {
            // mode: 'cors' is important for caching opaque responses correctly if needed, 
            // but for simple mp3s usually standard fetch is fine. 
            // We use standard fetch here.
            const res = await fetch(url, { signal });
            if (res.ok) return res;
            if (res.status === 404) return null; // File doesn't exist, don't retry
            throw new Error(`HTTP ${res.status}`);
        } catch (err: any) {
            if (err.name === 'AbortError') throw err;
            if (i === retries - 1) {
                console.warn(`Failed to cache audio: ${url}`);
                return null;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
};

export const cacheSurahAudio = async (surah: SurahDetail, reciterId: string, signal?: AbortSignal) => {
    if (!('caches' in window)) return;
    
    try {
        const cache = await caches.open('quran-audio-cache');
        const urlsToCache = surah.ayahs.map(ayah => {
            if (ayah.audio) return ayah.audio;
            return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
        });

        // Process in batches of 5 to avoid network congestion
        const BATCH_SIZE = 5;
        for (let i = 0; i < urlsToCache.length; i += BATCH_SIZE) {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            const batch = urlsToCache.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (url) => {
                if (signal?.aborted) return;
                
                // Check if already cached
                const match = await cache.match(url);
                if (match) return;

                const response = await fetchAudioWithRetry(url, signal);
                if (response) {
                    await cache.put(url, response);
                }
            }));
        }
    } catch (e: any) {
        if (e.name !== 'AbortError') console.warn("Audio Cache Error", e);
        else throw e;
    }
};

// --- Download Logic ---

export const downloadSurahs = async (
    surahList: Surah[], 
    translationId: string, 
    reciterId: string,
    includeAudio: boolean,
    includeTafsir: boolean,
    tafsirId: string,
    onProgress: (progress: number, current: string) => void,
    signal?: AbortSignal
) => {
    const BATCH_SIZE = 3; 
    let completed = 0;

    // Helper to process a batch
    const processBatch = async (batch: Surah[]) => {
        const promises = batch.map(async (surah) => {
            if (signal?.aborted) return;
            try {
                // Fetch Data
                const detail = await fetchSurahDetail(surah.number, reciterId, translationId, true, signal, includeTafsir ? tafsirId : undefined, includeTafsir); 
                
                if (signal?.aborted) return;

                if(detail) {
                    // Preserve existing tafsir if already cached and user didn't request new tafsir download
                    if (!includeTafsir) {
                        const existing = await getOfflineSurah(surah.number);
                        if (existing) {
                            detail.ayahs = detail.ayahs.map((ayah, idx) => ({
                                ...ayah,
                                tafsir: existing.ayahs?.[idx]?.tafsir || ayah.tafsir
                            }));
                        }
                    }
                    // Cache Audio if requested
                    if (includeAudio) {
                        await cacheSurahAudio(detail, reciterId, signal);
                    }
                    if (signal?.aborted) return;

                    // Save Data
                    await saveSurahOffline(detail, translationId, reciterId, includeAudio, includeTafsir ? tafsirId : undefined);
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') console.error(`Failed to download Surah ${surah.number}`, e);
                else throw e;
            } finally {
                if (!signal?.aborted) {
                    completed++;
                    onProgress(Math.round((completed / surahList.length) * 100), surah.englishName);
                }
            }
        });
        await Promise.all(promises);
    };

    // Chunk the list
    for (let i = 0; i < surahList.length; i += BATCH_SIZE) {
        if (signal?.aborted) break;
        const batch = surahList.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
    }
    
    if (!signal?.aborted) {
        // Update global count
        const currentDownloads = await getDownloadedSurahs();
        await updateGlobalMetadata(currentDownloads.length, translationId, reciterId, includeTafsir ? tafsirId : undefined);
    }
};

// --- Quran Data Service ---

const fetchWithRetry = async (url: string, retries = 3, delay = 1000, signal?: AbortSignal): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        try {
            const res = await fetch(url, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res;
        } catch (err: any) {
            if (err.name === 'AbortError') throw err;
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Fetch failed after retries');
};

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const res = await fetchWithRetry(`${QURAN_API_BASE}/surah`);
    const data = await res.json();
    return data.data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchDailyVerse = async (translationId: string, reciterId: string) => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const cacheKey = `daily_verse_${dateKey}_${translationId}_${reciterId}`;

    // 1. Try Cache
    try {
        const cached = await get(cacheKey);
        if (cached) return cached;
    } catch (e) {
        console.warn("Cache read error", e);
    }

    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const totalVerses = 6236;
    const verseIndex = ((dayOfYear * 13) % totalVerses) + 1; 

    try {
         let arabic, trans, audio;

         try {
            // Fetch Arabic
            const resAr = await fetchWithRetry(`${QURAN_API_BASE}/ayah/${verseIndex}/quran-uthmani`);
            const jsonAr = await resAr.json();
            arabic = jsonAr.data;

            // Fetch Translation
            const resTr = await fetchWithRetry(`${QURAN_API_BASE}/ayah/${verseIndex}/${translationId}`);
            const jsonTr = await resTr.json();
            trans = jsonTr.data;

            // Fetch Audio (Separate try/catch as this fails most often)
            try {
                const resAu = await fetch(`${QURAN_API_BASE}/ayah/${verseIndex}/${reciterId}`);
                const jsonAu = await resAu.json();
                audio = jsonAu.data;
            } catch (ex) {
                console.log("Audio fetch failed, ignoring");
            }

         } catch (err) {
             console.error("Fetch daily verse failed", err);
             return null;
         }
         
         if(arabic && trans) {
             const result = {
                 text: arabic.text,
                 translation: trans.text, 
                 audio: audio ? (audio.audio || (audio.audioSecondary ? audio.audioSecondary[0] : null)) : null, 
                 surah: arabic.surah,
                 numberInSurah: arabic.numberInSurah
             };

             await set(cacheKey, result);
             return result;
         }
    } catch(e) {
        console.error("Daily Verse Error", e);
    }
    return null;
}

export const fetchSurahDetail = async (
  surahNumber: number, 
  audioIdentifier: string, 
  translationIdentifier: string,
  forceNetwork: boolean = false,
  signal?: AbortSignal,
  tafsirId?: string,
  includeTafsir: boolean = false
): Promise<SurahDetail | null> => {
  try {
    // Check offline only if not forcing network
    if (!forceNetwork) {
        const offlineData = await getOfflineSurah(surahNumber);
        if (offlineData) {
            return offlineData;
        }
    }

    // Fetch in parallel but handle failures independently
    const arabicReq = fetchWithRetry(`${QURAN_API_BASE}/surah/${surahNumber}`, 3, 1000, signal);
    const transReq = fetchWithRetry(`${QURAN_API_BASE}/surah/${surahNumber}/${translationIdentifier}`, 3, 1000, signal);
    
    // Audio request shouldn't block the rest if it fails
    const audioReq = fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${audioIdentifier}`, { signal }).catch(e => null);

    const [arabicRes, transRes, audioRes] = await Promise.all([arabicReq, transReq, audioReq]);
    
    const arabicData = await arabicRes.json();
    const transData = await transRes.json();
    
    let audioData = null;
    if(audioRes && audioRes.ok) {
        try { audioData = await audioRes.json(); } catch(e){}
    }

    if(arabicData.code !== 200) throw new Error("Failed to load Surah Text");

    const surah: SurahDetail = arabicData.data;
    
    // Merge data safely
    surah.ayahs = surah.ayahs.map((ayah, index) => ({
      ...ayah,
      translation: transData?.data?.ayahs?.[index]?.text || "Translation Unavailable",
      audio: audioData?.data?.ayahs?.[index]?.audio || null
    }));

    if (includeTafsir && tafsirId) {
        for (const ayah of surah.ayahs) {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const tafsirText = await fetchTafsir(surah.number, ayah.numberInSurah, tafsirId);
            ayah.tafsir = tafsirText || undefined;
        }
    }

    return surah;
  } catch (e) {
    // Filter out abort errors to prevent logging them as crashes
    if ((e as Error).name !== 'AbortError') {
        console.error("Fetch Surah Error", e);
    }
    return null;
  }
};

export const fetchEditions = async (type: 'translation' | 'versebyverse' | 'tafsir'): Promise<Edition[]> => {
    try {
        let url = `${QURAN_API_BASE}/edition?type=${type}`;
        if(type === 'versebyverse') url = `${QURAN_API_BASE}/edition?format=audio&type=versebyverse`;

        const response = await fetchWithRetry(url);
        const data = await response.json();
        const editions: Edition[] = data.data || [];

        // Manually Inject Persian Tafseers/Exegesis since API type=tafsir lacks them
        // We use translations that are known to be interpretive/tafsir-based
        if (type === 'tafsir') {
            editions.push(
                {
                    identifier: 'fa.makarem',
                    language: 'fa',
                    name: 'تفسیر نمونه (خلاصه - مکارم شیرازی)',
                    englishName: 'Tafseer Nemuneh (Makarem)',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.khorramshahi',
                    language: 'fa',
                    name: 'تفسیر و ترجمه (خرمشاهی)',
                    englishName: 'Tafseer Khorramshahi',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.moezzi',
                    language: 'fa',
                    name: 'ترجمه و تفسیر (معزی)',
                    englishName: 'Tafseer Moezzi',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.ansarian',
                    language: 'fa',
                    name: 'تفسیر انصاریان',
                    englishName: 'Tafseer Ansarian',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.ayati',
                    language: 'fa',
                    name: 'تفسیر و ترجمه (آیتی)',
                    englishName: 'Ayati (Interpretive Translation)',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.fooladvand',
                    language: 'fa',
                    name: 'تفسیر فولادوند',
                    englishName: 'Fooladvand (Commentary)',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.ghomshei',
                    language: 'fa',
                    name: 'تفسیر الهی قمشه‌ای',
                    englishName: 'Elahi Ghomshei',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.bahrampour',
                    language: 'fa',
                    name: 'تفسیر بهرام‌پور',
                    englishName: 'Bahrampour',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.mojtabavi',
                    language: 'fa',
                    name: 'تفسیر مجتبوی',
                    englishName: 'Mojtabavi',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.khorramdel',
                    language: 'fa',
                    name: 'تفسیر خرم‌دل',
                    englishName: 'Khorramdel',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.gharaati',
                    language: 'fa',
                    name: 'تفسیر قرائتی',
                    englishName: 'Gharaati',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.sadeqi',
                    language: 'fa',
                    name: 'تفسیر صادقی تهرانی',
                    englishName: 'Sadeqi Tehrani',
                    format: 'text',
                    type: 'tafsir'
                },
                {
                    identifier: 'fa.safavi',
                    language: 'fa',
                    name: 'تفسیر صفوی',
                    englishName: 'Safavi',
                    format: 'text',
                    type: 'tafsir'
                }
            );
        }

        return editions;
    } catch(e) {
        return [];
    }
}

export const fetchTafsir = async (surahNumber: number, ayahNumber: number, tafsirId: string, surahName?: string): Promise<string | null> => {
    try {
        const res = await fetchWithRetry(`${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`);
        const data = await res.json();
        return data.data?.text || null;
    } catch(e) {
        console.error("Tafsir Fetch Error", e);
        return null;
    }
}

export const searchQuran = async (query: string, edition: string = 'en.sahih'): Promise<any> => {
    try {
        // Search within the specific edition selected by the user
        const res = await fetchWithRetry(`${QURAN_API_BASE}/search/${encodeURIComponent(query)}/${edition}`);
        const data = await res.json();
        return data.data || { matches: [], count: 0 };
    } catch (e) {
        return { matches: [], count: 0 };
    }
}

export const searchQuranFallbackTranslation = async (query: string, translationId: string, surahs: Surah[], maxResults = 25, signal?: AbortSignal) => {
    const matches: any[] = [];
    const lowerQ = query.toLowerCase();
    for (const s of surahs) {
        if (signal?.aborted) break;
        const detail = await fetchSurahDetail(s.number, 'ar.alafasy', translationId, true, signal);
        if (!detail) continue;
        detail.ayahs.forEach((ayah) => {
            if (ayah.translation && ayah.translation.toLowerCase().includes(lowerQ)) {
                matches.push({
                    surah: detail,
                    numberInSurah: ayah.numberInSurah,
                    text: ayah.translation,
                    _source: 'translation-fallback'
                });
            }
        });
        if (matches.length >= maxResults) break;
    }
    return { matches, count: matches.length };
};
