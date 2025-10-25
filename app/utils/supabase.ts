import { createClient } from "@supabase/supabase-js";
import type { Technique } from "~/types";
import type {RuntimeConfig} from "nuxt/schema";

const config: RuntimeConfig = useRuntimeConfig()
const supabaseUrl: string = config.public.supabaseUrl;
const supabaseKey: string = config.public.supabasePublishableKey;
const cacheDuration: number = 60 * 60 * 1000
let cacheName: string
let cacheKey: string
let supabaseClient: any = null

const supabase = () => {
    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseKey);
        console.log('client created');
    }
    console.log('client returned');
    return supabaseClient;
}

const getCache = async (CACHE_NAME: string, CACHE_KEY: string, CACHE_DURATION: number): Promise<any[]> => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(CACHE_KEY)

        if (cachedResponse) {
            const { data, timestamp } = await cachedResponse.json()
            const now = Date.now()

            if (now - timestamp < CACHE_DURATION) {
                console.log('get cache data')
                return data
            } else {
                await cache.delete(CACHE_KEY)
            }
        }
    } catch (error) {
        console.error('Cache API error:', error)
    }
    return []
}

const setCache = async (CACHE_NAME: string, CACHE_KEY: string, data: any) => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const cacheData = {
            data,
            timestamp: Date.now()
        }

        const response = new Response(JSON.stringify(cacheData), {
            headers: { 'Content-Type': 'application/json' }
        })

        await cache.put(CACHE_KEY, response)
        console.log('set cache data')
    } catch (error) {
        console.error('Failed to cache data:', error)
    }
}


const getTechniques = async (sb: any): Promise<Technique[]> => {
    let techniques : Technique[]
    cacheName = 'techniques-cache'
    cacheKey = 'techniques-data'

    if (import.meta.client) {
        techniques = await getCache(cacheName, cacheKey, cacheDuration)
        console.log('got data from cache:', techniques)
        if (techniques.length > 0) return techniques
    }

    const { data } = await sb.from('Techniques').select('*')
    techniques = data as Technique[]

    if (import.meta.client && data) {
        console.log('got data from API:', techniques)
        await setCache(cacheName, cacheKey, data)
    }

    return techniques
}

export {getTechniques, supabase}