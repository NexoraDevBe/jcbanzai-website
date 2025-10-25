import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Technique } from "~/types";
import type { RuntimeConfig } from "nuxt/schema";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
    if (!supabaseClient) {
        const config: RuntimeConfig = useRuntimeConfig();
        const supabaseUrl: string = config.public.supabaseUrl;
        const supabaseKey: string = config.public.supabasePublishableKey;

        supabaseClient = createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client created');
    }
    return supabaseClient;
};

const getCache = async (
    cacheName: string,
    cacheKey: string,
    cacheDuration: number
): Promise<any[] | null> => {
    if (!import.meta.client) return null;

    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            const { data, timestamp } = await cachedResponse.json();
            const now = Date.now();

            if (now - timestamp < cacheDuration) {
                console.log(`Cache hit for ${cacheKey}`);
                return data;
            } else {
                console.log(`Cache expired for ${cacheKey}`);
                await cache.delete(cacheKey);
            }
        }
    } catch (error) {
        console.error('Cache API error:', error);
    }
    return null;
};

const setCache = async (
    cacheName: string,
    cacheKey: string,
    data: any
): Promise<void> => {
    if (!import.meta.client) return;

    try {
        const cache = await caches.open(cacheName);
        const cacheData = {
            data,
            timestamp: Date.now()
        };

        const response = new Response(JSON.stringify(cacheData), {
            headers: { 'Content-Type': 'application/json' }
        });

        await cache.put(cacheKey, response);
        console.log(`Cache set for ${cacheKey}`);
    } catch (error) {
        console.error('Failed to cache data:', error);
    }
};

const getTechniques = async (): Promise<Technique[]> => {
    const CACHE_NAME = 'techniques-cache';
    const CACHE_KEY = 'techniques-data';

    const cachedData = await getCache(CACHE_NAME, CACHE_KEY, CACHE_DURATION);
    if (cachedData && cachedData.length > 0) {
        console.log('Returning techniques from cache');
        return cachedData as Technique[];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('Techniques').select('*');

    if (error) {
        console.error('Error fetching techniques:', error);
        throw error;
    }

    const techniques = (data || []) as Technique[];
    console.log('Fetched techniques from Supabase:', techniques.length);

    if (techniques.length > 0) {
        await setCache(CACHE_NAME, CACHE_KEY, techniques);
    }

    return techniques;
};

export {
    getSupabaseClient,
    getTechniques
};