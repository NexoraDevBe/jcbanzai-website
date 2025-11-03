import {type AuthError, type AuthTokenResponsePassword, createClient, type UserResponse} from "@supabase/supabase-js";
import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type {Technique, UserData} from "~/types";
import type { RuntimeConfig } from "nuxt/schema";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let supabaseClient: SupabaseClient | null = null;
let userData: UserData | null = null;
let userDataPromise: Promise<UserData> | null = null;

const consoleLog = (message: string, value?: any): void => {
    console.log('%csupabase%c ' + message, 'color: green; font-weight: bold', '', value);
}

const consoleWarn = (message: string, value?: any): void => {
    console.warn('%csupabase%c ' + message, 'color: green; font-weight: bold', '', value);
}

const consoleErr = (message: string, value?: any): void => {
    console.error('%csupabase%c ' + message, 'color: green; font-weight: bold', '', value);
}

// INITIALIZER

const getSupabaseClient = (): SupabaseClient => {
    if (!supabaseClient) {
        const config: RuntimeConfig = useRuntimeConfig();
        const supabaseUrl: string = config.public.supabaseUrl;
        const supabaseKey: string = config.public.supabasePublishableKey;

        supabaseClient = createClient(supabaseUrl, supabaseKey);
        consoleLog('client created');
    }
    return supabaseClient;
};

// LOCAL FUNCTIONS

const getCache = async (cacheName: string, cacheKey: string, cacheDuration: number): Promise<any[] | null> => {
    if (!import.meta.client) return null;

    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            const { data, timestamp } = await cachedResponse.json();
            const now = Date.now();

            if (now - timestamp < cacheDuration) {
                consoleLog('Cache hit for ', cacheKey);
                return data;
            } else {
                consoleLog('Cache expired for ', cacheKey);
                await cache.delete(cacheKey);
            }
        }
    } catch (error) {
        consoleErr('Cache API error:', error);
    }
    return null;
};

const setCache = async (cacheName: string, cacheKey: string, data: any): Promise<void> => {
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
        consoleLog('Cache set for ', cacheKey);
    } catch (error) {
        consoleErr('Failed to cache data:', error);
    }
};

const checkEmailExists = async (email: string): Promise<boolean> => {
    const { data, error } = await getSupabaseClient()
        .rpc('check_email_exists', { check_email: email })

    consoleLog('email check data:', data)
    if (error)
        consoleLog('email check error:', error)

    if (error) return false
    return !!data
}

const getUserRole = async (): Promise<string | null> => {
    const { data, error } = await getSupabaseClient()
        .rpc('get_my_role');

    consoleLog('user role data:', data)
    if (error)
        consoleWarn('user role error:', error)

    if (error) return null
    return data
}

const setUserData = async (user: User, session: Session) => {
    const role = await getUserRole()

    userData = {
        user: user,
        session: session,
        role: role
    }
    consoleLog('user data set data:', userData)
}

// GLOBAL FUNCTIONS

const getTechniques = async (): Promise<Technique[]> => {
    const CACHE_NAME = 'techniques-cache';
    const CACHE_KEY = 'techniques-data';

    const cachedData = await getCache(CACHE_NAME, CACHE_KEY, CACHE_DURATION);
    if (cachedData && cachedData.length > 0) {
        consoleLog('Returning techniques from cache');
        return cachedData as Technique[];
    }

    const { data, error } = await getSupabaseClient().from('Techniques').select('*');

    if (error) {
        consoleErr('Error fetching techniques:', error);
        throw error;
    }

    const techniques = (data || []) as Technique[];
    consoleLog('Fetched techniques from Supabase:', techniques.length);

    if (techniques.length > 0) {
        await setCache(CACHE_NAME, CACHE_KEY, techniques);
    }

    return techniques;
};

const login = async (email: string, password: string): Promise<AuthTokenResponsePassword> => {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: email,
        password: password,
    })

    consoleLog('login data:', data)
    if (error)
        consoleErr('login error:', error)

    if (!error && data.user && data.session)
        await setUserData(data.user, data.session)

    return { data, error } as AuthTokenResponsePassword;
}

const register = async (email: string, password: string): Promise<AuthTokenResponsePassword> => {
    if (await checkEmailExists(email)) {
        const { data, error } = await getSupabaseClient().auth.signUp({
            email: email,
            password: password,
        })

        consoleLog('register data:', data)
        if (error)
        consoleErr('register error:', error)

        if (!error && data.user && data.session)
            await setUserData(data.user!, data.session!)

        return { data, error } as AuthTokenResponsePassword;
    }
    else {
        return {
            data: {
                user: null,
                session: null,
            },
            error: {
                name: 'AuthError',
                message: 'Toegang geweigerd: onvoldoende rechten.',
                status: 403,
            } as AuthError,
        }
    }
}

const logout = async () => {
    userData = null; // Clear cached user data
    userDataPromise = null; // Clear any pending promises
    await getSupabaseClient().auth.signOut();
    return navigateTo('/dashboard/login')
}

const getUserData = async (): Promise<UserData> => {
    consoleLog('getUserData called, current userData:', userData)

    if (userData?.user && userData?.session) {
        consoleLog('Returning cached userData')
        return userData;
    }

    if (userDataPromise) {
        consoleLog('Waiting for existing getUserData promise')
        return userDataPromise;
    }

    userDataPromise = (async () => {
        try {
            const { data: { user }, error: userError } = await getSupabaseClient().auth.getUser()
            const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession()

            if (userError || sessionError || !user || !session) {
                consoleWarn('No valid user/session found')
                userData = null;
                return null as any;
            }

            await setUserData(user, session)
            return userData!;
        } finally {
            userDataPromise = null;
        }
    })();

    return userDataPromise;
}

const insertMember = async (
    name: string,
    lastname: string,
    gender: string,
    birthdate: string, // From date input field (YYYY-MM-DD format)
    nation: string,
    street: string,
    city: string,
    zipcode: string,
    phone: string,
    emails: string[],
    uitpas?: string,
) => {
    const values = {
        Voornaam: name,
        Naam: lastname,
        Geslacht: gender,
        Geboorte_datum: birthdate,
        Nationaliteit: nation,
        Straat: street,
        Postcode: zipcode,
        Gemeente: city,
        Gsm: phone,
        Emails: emails,
        ...(uitpas && { Lidgeld_opmerkingen: 'UiTPAS nr:' + uitpas }),
    }

    const { data, error } = await getSupabaseClient().from('Members').insert(values)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('insertMember:', data)
    return { success: true, data }
}

if (import.meta.client) {
    getUserData().catch(err => {
        consoleWarn('Initial user data fetch failed:', err)
    });
}

export {
    getSupabaseClient,
    getTechniques,
    login,
    register,
    logout,
    getUserData,
    insertMember
};