import type {Session, SupabaseClient, User} from "@supabase/supabase-js";
import {type AuthError, type AuthTokenResponsePassword, createClient} from "@supabase/supabase-js";
import type {Member, Planning, Technique, Trainer, UserData} from "~/types";
import type {RuntimeConfig} from "nuxt/schema";
import {useUserStore} from "~/stores/user";

let supabaseClient: SupabaseClient | null = null;
let userData: UserData | null = null;
let userDataPromise: Promise<UserData | null> | null = null;

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

// const getCache = async (cacheName: string, cacheKey: string, cacheDuration: number): Promise<any[] | null> => {
//     if (!import.meta.client) return null;
//
//     try {
//         const cache = await caches.open(cacheName);
//         const cachedResponse = await cache.match(cacheKey);
//
//         if (cachedResponse) {
//             const { data, timestamp } = await cachedResponse.json();
//             const now = Date.now();
//
//             if (now - timestamp < cacheDuration) {
//                 consoleLog('Cache hit for ', cacheKey);
//                 return data;
//             } else {
//                 consoleLog('Cache expired for ', cacheKey);
//                 await cache.delete(cacheKey);
//             }
//         }
//     } catch (error) {
//         consoleErr('Cache API error:', error);
//     }
//     return null;
// };
//
// const setCache = async (cacheName: string, cacheKey: string, data: any): Promise<void> => {
//     if (!import.meta.client) return;
//
//     try {
//         const cache = await caches.open(cacheName);
//         const cacheData = {
//             data,
//             timestamp: Date.now()
//         };
//
//         const response = new Response(JSON.stringify(cacheData), {
//             headers: { 'Content-Type': 'application/json' }
//         });
//
//         await cache.put(cacheKey, response);
//         consoleLog('Cache set for ', cacheKey);
//     } catch (error) {
//         consoleErr('Failed to cache data:', error);
//     }
// };

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
                message: 'Toegang geweigerd, contacteer een bevoegd persoon.',
                status: 403,
            } as AuthError,
        }
    }
}

const logout = async () => {
    navigateTo('/dashboard/auth')
    userData = null;
    userDataPromise = null;
    useUserStore().clearData();
    await getSupabaseClient().auth.signOut();
}

const getUserData = async (): Promise<UserData | null> => {
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
                return null;
            }

            await setUserData(user, session)
            return userData!;
        } finally {
            userDataPromise = null;
        }
    })();

    return userDataPromise;
}

// TECHNIQUES

const getTechniques = async (): Promise<Technique[]> => {
    const { data, error } = await getSupabaseClient().from('Techniques')
        .select(`
            id,
            name,
            belt,
            category,
            translation,
            video
        `);

    if (error) {
        consoleErr('Error fetching techniques:', error);
        throw error;
    }

    const techniques = (data || []) as Technique[];
    consoleLog('Fetched techniques from Supabase:', techniques.length);

    return techniques;
};

const insertTechnique = async (name: string, belt: string, category: string, translation: string, video: string) => {
    const values = {
        name: name,
        belt: belt,
        category: category,
        translation: translation,
        video: video,
    }

    const { data, error } = await getSupabaseClient().from('Techniques').insert(values)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('insertTechnique:', data)
    return { success: true, data }
}

const updateTechnique = async (technique: Technique) => {
    const { data, error } = await getSupabaseClient()
        .from('Techniques')
        .update(technique)
        .eq('id', technique.id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('updateTechnique:', data)
    return { success: true, data }
}

const deleteTechnique = async (id: number) => {
    const { data, error } = await getSupabaseClient()
        .from('Techniques')
        .delete()
        .eq('id', id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('deleteTechnique:', data)
    return { success: true, data }
}

// MEMBERS

const getMembers = async (): Promise<Member[]> => {
    const { data, error } = await getSupabaseClient().from('Members')
        .select(`
            id,
            Actief,
            Vergunning,
            Vergunning_geldig_tot,
            Voornaam,
            Naam,
            Geslacht,
            Geboorte_datum,
            Nationaliteit,
            Straat,
            Postcode,
            Gemeente,
            Gsm,
            Gsm2_Telefoon,
            Emails,
            In_judovlaanderen,
            Dojos,
            Wedstrijd_training,
            Graad,
            Gordel_behaald_op,
            Behaald_examen,
            Door_wie_examen,
            Datum_examen,
            Lidgeld_opmerkingen,
            updated_at
          `);

    if (error) {
        consoleErr('Error fetching members:', error);
        throw error;
    }

    const members = (data || []);
    consoleLog('Fetched members from Supabase:', members.length);

    return members as unknown as Member[];
};

const getMemberById = async (id: number): Promise<Member> => {
    const { data, error } = await getSupabaseClient().from('Members')
        .select(`
            id,
            Actief,
            Vergunning,
            Vergunning_geldig_tot,
            Voornaam,
            Naam,
            Geslacht,
            Geboorte_datum,
            Nationaliteit,
            Straat,
            Postcode,
            Gemeente,
            Gsm,
            Gsm2_Telefoon,
            Emails,
            In_judovlaanderen,
            Dojos,
            Wedstrijd_training,
            Graad,
            Gordel_behaald_op,
            Behaald_examen,
            Door_wie_examen,
            Datum_examen,
            Lidgeld_opmerkingen,
            updated_at
          `).eq('id', id);

    if (error) {
        consoleErr('Error fetching members:', error);
        throw error;
    }

    const member = (data[0] || null);
    consoleLog('Fetched members from Supabase:', member);

    return member as unknown as Member;
};

const insertMember = async (name: string, lastname: string, gender: string, birthdate: string, nation: string, street: string, city: string, zipcode: string, phone: string, emails: string[], uitpas?: string) => {
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
        Dojos: ['']
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

const updateMember = async (local: Member, original: Member) => {
    const server = await getMemberById(local.id);

    if (server.updated_at === original.updated_at) {
        return commitMember(local);
    }

    const merged: Member = { ...local };

    for (const key of Object.keys(local) as (keyof Member)[]) {
        const localVal = local[key];
        const origVal = original[key];
        const serverVal = server[key];

        // Skip updated_at and same values
        if (key === "updated_at") continue;
        if (serverVal === localVal) continue;

        // NOTHING CHANGED LOCALLY → just use serverVal
        if (JSON.stringify(localVal) === JSON.stringify(origVal)) {
            // @ts-expect-error typescript says never
            merged[key] = serverVal;
        }
    }

    console.log("All fields auto-merged cleanly. Saving…");
    return commitMember(merged);
};

const commitMember = async (member: Member) => {
    member.updated_at = new Date().toISOString();

    const { data, error } = await getSupabaseClient()
        .from('Members')
        .update(member)
        .eq('id', member.id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('updateMember:', data)
    return { success: true, data }
}

const deleteMember = async (id: number) => {
    const { data, error } = await getSupabaseClient()
        .from('Members')
        .delete()
        .eq('id', id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('deleteMember:', data)
    return { success: true, data }
}

// PLANNING

const getPlanning = async (): Promise<Planning[]> => {
    const { data, error } = await getSupabaseClient().from('Planning')
        .select(`
            id,
            day,
            type,
            beschikbaar,
            planning,
            updated_at
        `);

    if (error) {
        consoleErr('Error fetching planning:', error);
        throw error;
    }

    const planning = (data || []) as Planning[];
    consoleLog('Fetched planning from Supabase:', planning.length);

    return planning;
};

const getPlanningById = async (id: number): Promise<Planning> => {
    const { data, error } = await getSupabaseClient().from('Planning')
        .select(`
            id,
            day,
            type,
            beschikbaar,
            planning,
            updated_at
        `).eq('id', id);

    if (error) {
        consoleErr('Error fetching planning:', error);
        throw error;
    }

    const planning = (data[0] || null);
    consoleLog('Fetched planning from Supabase:', planning);

    return planning as unknown as Planning;
};

const getPlanningByMonth = async (year: number, month: number): Promise<Planning[]> => {
    const { data, error } = await getSupabaseClient().from('Planning')
        .select(`
            id,
            day,
            type,
            beschikbaar,
            planning,
            updated_at
        `).gte('day', `${year}-${month}-01`)
        .lt('day', `${year}-${(month === 12 ? '01' : month+1)}-01`);

    if (error) {
        consoleErr('Error fetching planning:', error);
        throw error;
    }

    const planning = (data || null);
    consoleLog('Fetched planning from Supabase:', planning.length);

    return planning as unknown as Planning[];
};

const getDistinctPlanningMonths = async (): Promise<{ year: number; month: number }[]> => {
    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .select('day');

    if (error) {
        consoleErr('Error fetching planning dates:', error);
        throw error;
    }

    if (!data || data.length === 0) {
        consoleLog('No planning data found');
        return [];
    }

    // Extract unique year-month combinations
    const monthYearSet = new Set<string>();

    data.forEach((item) => {
        if (item.day) {
            const date = new Date(item.day);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // getMonth() returns 0-11
            monthYearSet.add(`${year}-${month}`);
        }
    });

    // Convert set to array of objects and sort
    const distinctMonths: { year: number; month: number }[] =
        Array.from(monthYearSet)
            .map((yearMonth) => {
                const [year, month] = yearMonth
                    .split('-')
                    .map(Number) as [number, number];

                return { year, month };
            })
            .sort((a, b) =>
                a.year !== b.year
                    ? a.year - b.year
                    : a.month - b.month
            );

    consoleLog('Distinct months from planning:', distinctMonths.length);
    return distinctMonths;
};

const insertPlanning = async (planning: Planning) => {
    const { data, error } = await getSupabaseClient().from('Planning').insert(planning)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('insert Planning:', data)
    return { success: true, data }
}

const updatePlanning = async (local: Planning, original: Planning) => {
    const server = await getPlanningById(local.id);

    if (server.updated_at === original.updated_at) {
        return commitPlanning(local);
    }

    const merged: Planning = { ...local };

    for (const key of Object.keys(local) as (keyof Planning)[]) {
        const localVal = local[key];
        const origVal = original[key];
        const serverVal = server[key];

        // Skip updated_at and same values
        if (key === "updated_at") continue;
        if (serverVal === localVal) continue;

        // NOTHING CHANGED LOCALLY → just use serverVal
        if (JSON.stringify(localVal) === JSON.stringify(origVal)) {
            // @ts-expect-error typescript says never
            merged[key] = serverVal;
        }
    }

    return commitPlanning(merged);
};

const commitPlanning = async (planning: Planning) => {
    planning.updated_at = new Date().toISOString();

    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .update(planning)
        .eq('id', planning.id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('update Planning:', data)
    return { success: true, data }
}

const deletePlanning = async (id: number) => {
    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .delete()
        .eq('id', id)

    if (error) {
        consoleErr('Error details:', error.message)
        consoleErr('Error hint:', error.hint)
        consoleErr('Error details:', error.details)
        return { success: false, error }
    }

    consoleLog('delete Planning:', data)
    return { success: true, data }
}

// TRAINERS

const getTrainers = async (): Promise<Trainer[]> => {
    const { data, error } = await getSupabaseClient().from('Trainers')
        .select(`
            id,
            Voornaam,
            Naam,
            Gsm,
            Email,
            Check_strafregister,
            Check_door,
            Straat,
            Gemeente,
            Postcode,
            Titels
        `);

    if (error) {
        consoleErr('Error fetching trainers:', error);
        throw error;
    }

    const trainers = (data || []) as Trainer[];
    consoleLog('Fetched trainers from Supabase:', trainers.length);

    return trainers;
};

const getTrainerNames = async (): Promise<Partial<Trainer>[]> => {
    const { data, error } = await getSupabaseClient().from('Trainers')
        .select(`
            id,
            Voornaam,
            Naam
        `).order('Voornaam');

    if (error) {
        consoleErr('Error fetching trainers:', error);
        throw error;
    }

    const trainernames = (data || []) as Partial<Trainer>[];
    consoleLog('Fetched trainers from Supabase:', trainernames.length);

    return trainernames;
};

export {
    getSupabaseClient,

    login,
    register,
    logout,
    getUserData,

    getTechniques,
    insertTechnique,
    updateTechnique,
    deleteTechnique,

    getMembers,
    insertMember,
    updateMember,
    deleteMember,

    getPlanning,
    getPlanningByMonth,
    getDistinctPlanningMonths,
    insertPlanning,
    updatePlanning,
    deletePlanning,

    getTrainers,
    getTrainerNames,
};