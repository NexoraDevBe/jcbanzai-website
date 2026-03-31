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
    navigateTo('/')
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

export interface TechniqueQueryParams {
    sort?: { key: string; order: 'asc' | 'desc' }
    filters?: Record<string, any[]>
}

const getTechniques = async (params: TechniqueQueryParams = {}): Promise<Technique[]> => {
    const { sort, filters = {} } = params

    let query = getSupabaseClient()
        .from('Techniques')
        .select('id, name, belt, category, translation, video')

    // All Technique columns are scalar, so .in() covers everything
    for (const [field, values] of Object.entries(filters)) {
        if (!values || values.length === 0) continue
        query = query.in(field, values)
    }

    const sortKey = sort?.key ?? 'name'
    query = query.order(sortKey, { ascending: sort ? sort.order === 'asc' : true })

    const { data, error } = await query

    if (error) {
        consoleErr('Error fetching techniques:', error)
        throw error
    }

    consoleLog('Fetched techniques:', data?.length)
    return (data ?? []) as Technique[]
}

// Runs once — all columns are worth filtering since the dataset is small and static
const getTechniqueFilterOptions = async (): Promise<Record<string, any[]>> => {
    const { data, error } = await getSupabaseClient()
        .from('Techniques')
        .select('belt, category')

    if (error) {
        consoleErr('Error fetching technique filter options:', error)
        throw error
    }

    const belts = new Set<string>()
    const categories = new Set<string>()

    for (const row of data ?? []) {
        if (row.belt) belts.add(row.belt)
        if (row.category) categories.add(row.category)
    }

    return {
        belt: Array.from(belts).sort((a, b) => a.localeCompare(b)),
        category: Array.from(categories).sort((a, b) => a.localeCompare(b)),
    }
}

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

export interface MemberQueryParams {
    sort?: { key: string; order: 'asc' | 'desc' }
    filters?: Record<string, any[]>
    page?: number
    pageSize?: number
}

export interface MemberQueryResult {
    data: Member[]
    count: number
}

const getMembers = async (params: MemberQueryParams = {}): Promise<MemberQueryResult> => {
    const { sort, filters = {}, page = 1, pageSize = 50 } = params

    const SELECT_FIELDS = `
    id, Actief, Vergunning, Vergunning_geldig_tot,
    Voornaam, Naam, Geslacht, Geboorte_datum, Nationaliteit,
    Straat, Postcode, Gemeente, Gsm, Gsm2_Telefoon, Emails,
    In_judovlaanderen, Dojos, Wedstrijd_training, Graad,
    Gordel_behaald_op, Behaald_examen, Door_wie_examen,
    Datum_examen, Lidgeld_opmerkingen, updated_at, created_at
  `

    let query = getSupabaseClient()
        .from('Members')
        .select(SELECT_FIELDS, { count: 'exact' })

    // Filters
    for (const [field, values] of Object.entries(filters)) {
        if (!values || values.length === 0) continue

        const col = field as keyof Member

        // Arrays in Postgres (like Emails, Dojos) need .overlaps()
        const arrayColumns = ['Emails', 'Dojos']
        if (arrayColumns.includes(field)) {
            query = query.overlaps(col, values)
        } else {
            query = query.in(col, values)
        }
    }

    // Sort
    if (sort?.key) {
        query = query.order(sort.key, { ascending: sort.order === 'asc' })
    } else {
        query = query.order('Naam', { ascending: true })
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
        consoleErr('Error fetching members:', error)
        throw error
    }

    consoleLog('Fetched members:', data?.length + 'of' + count)
    return { data: (data ?? []) as unknown as Member[], count: count ?? 0 }
}

// Runs ONCE to populate filter checkboxes
// Fetches only the columns you want to filter on, no pagination
const getMemberFilterOptions = async (): Promise<Record<string, any[]>> => {
    const { data, error } = await getSupabaseClient()
        .from('Members')
        .select('Actief, Geslacht, Nationaliteit, Graad, Dojos, Wedstrijd_training, In_judovlaanderen')

    if (error) {
        consoleErr('Error fetching filter options:', error)
        throw error
    }

    const sets: Record<string, Set<any>> = {}

    for (const row of data ?? []) {
        for (const [key, value] of Object.entries(row)) {
            if (!sets[key]) sets[key] = new Set()
            if (Array.isArray(value)) {
                // @ts-ignore
                value.forEach(v => sets[key].add(v))
            } else if (value !== null && value !== undefined) {
                sets[key].add(value)
            }
        }
    }

    return Object.fromEntries(
        Object.entries(sets).map(([k, s]) => [
            k,
            Array.from(s).sort((a, b) => String(a).localeCompare(String(b)))
        ])
    )
}

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

export interface PlanningQueryParams {
    year: number
    month: number
    sort?: { key: string; order: 'asc' | 'desc' }
    filters?: Record<string, any[]>
}

const getPlanningByMonth = async (params: PlanningQueryParams): Promise<Planning[]> => {
    const { year, month, sort, filters = {} } = params

    // Zero-pad for reliable string comparison in Postgres
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear  = month === 12 ? year + 1 : year
    const to = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    let query = getSupabaseClient()
        .from('Planning')
        .select('id, day, type, beschikbaar, planning, updated_at')
        .gte('day', from)
        .lt('day', to)

    // Filters — Planning columns are all scalar except beschikbaar/planning (arrays)
    const arrayColumns = ['beschikbaar', 'planning']
    for (const [field, values] of Object.entries(filters)) {
        if (!values || values.length === 0) continue
        if (arrayColumns.includes(field)) {
            query = query.overlaps(field, values)
        } else {
            query = query.in(field, values)
        }
    }

    // Sort — default to day asc so the table always shows chronologically
    const sortKey  = sort?.key ?? 'day'
    const sortAsc  = sort ? sort.order === 'asc' : true
    query = query.order(sortKey, { ascending: sortAsc })

    // Secondary sort: within same day keep type order stable
    if (sortKey !== 'id') query = query.order('id', { ascending: true })

    const { data, error } = await query

    if (error) {
        consoleErr('Error fetching planning:', error)
        throw error
    }

    consoleLog('Fetched planning:', data?.length)
    return (data ?? []) as unknown as Planning[]
}

// Filter options — only the filterable scalar columns + type
// beschikbaar/planning arrays are too dynamic to pre-build checkbox lists for
const getPlanningFilterOptions = async (): Promise<Record<string, any[]>> => {
    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .select('type')

    if (error) {
        consoleErr('Error fetching planning filter options:', error)
        throw error
    }

    const typeSet = new Set<string>()
    for (const row of data ?? []) {
        if (row.type) typeSet.add(row.type)
    }

    return {
        type: Array.from(typeSet).sort((a, b) => a.localeCompare(b))
    }
}

const getDistinctPlanningMonths = async (): Promise<{ year: number; month: number }[]> => {
    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .select('day')

    if (error) {
        consoleErr('Error fetching planning dates:', error)
        throw error
    }

    const monthYearSet = new Set<string>()
    for (const item of data ?? []) {
        if (item.day) {
            const date = new Date(item.day)
            monthYearSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`)
        }
    }

    return Array.from(monthYearSet)
        .map(ym => {
            const [year, month] = ym.split('-').map(Number) as [number, number]
            return { year, month }
        })
        .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
}

// Remove the old getPlanning (full table fetch) and getPlanningById from exports
// — they're only used internally by updatePlanning which still needs getPlanningById:
const getPlanningById = async (id: number): Promise<Planning> => {
    const { data, error } = await getSupabaseClient()
        .from('Planning')
        .select('id, day, type, beschikbaar, planning, updated_at')
        .eq('id', id)
        .single() // cleaner than data[0]

    if (error) {
        consoleErr('Error fetching planning by id:', error)
        throw error
    }

    return data as unknown as Planning
}

const insertPlanning = async (planning: Planning) => {
    // Check if a row for this day+type already exists before inserting
    const { data: existing } = await getSupabaseClient()
        .from('Planning')
        .select('id')
        .eq('day', planning.day)
        .eq('type', planning.type)
        .maybeSingle()

    if (existing) {
        consoleWarn('insertPlanning: skipping duplicate', [planning.day, planning.type])
        return { success: true, data: existing }
    }

    const { data, error } = await getSupabaseClient().from('Planning').insert(planning)

    if (error) {
        consoleErr('Error details:', error.message)
        return { success: false, error }
    }

    consoleLog('insertPlanning:', data)
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

export interface TrainerQueryParams {
    sort?: { key: string; order: 'asc' | 'desc' }
    filters?: Record<string, any[]>
}

const getTrainers = async (params: TrainerQueryParams = {}): Promise<Trainer[]> => {
    const { sort, filters = {} } = params

    let query = getSupabaseClient()
        .from('Trainers')
        .select('id, Voornaam, Naam, Gsm, Email, Check_strafregister, Check_door, Straat, Gemeente, Postcode, Titels')

    for (const [field, values] of Object.entries(filters)) {
        if (!values || values.length === 0) continue
        query = query.in(field, values)
    }

    const sortKey = sort?.key ?? 'Naam'
    query = query.order(sortKey, { ascending: sort ? sort.order === 'asc' : true })

    const { data, error } = await query

    if (error) {
        consoleErr('Error fetching trainers:', error)
        throw error
    }

    consoleLog('Fetched trainers:', data?.length)
    return (data ?? []) as Trainer[]
}

const getTrainerFilterOptions = async (): Promise<Record<string, any[]>> => {
    const { data, error } = await getSupabaseClient()
        .from('Trainers')
        .select('Check_strafregister, Titels')

    if (error) {
        consoleErr('Error fetching trainer filter options:', error)
        throw error
    }

    const strafregister = new Set<any>()
    const titels = new Set<string>()

    for (const row of data ?? []) {
        if (row.Check_strafregister !== null) strafregister.add(row.Check_strafregister)
        if (Array.isArray(row.Titels)) {
            row.Titels.forEach((t: string) => titels.add(t))
        } else if (row.Titels) {
            titels.add(row.Titels)
        }
    }

    return {
        Check_strafregister: Array.from(strafregister).sort((a, b) => String(a).localeCompare(String(b))),
        Titels: Array.from(titels).sort((a, b) => a.localeCompare(b)),
    }
}

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
    getTechniqueFilterOptions,
    insertTechnique,
    updateTechnique,
    deleteTechnique,

    getMembers,
    getMemberFilterOptions,
    insertMember,
    updateMember,
    deleteMember,

    getPlanningByMonth,
    getPlanningFilterOptions,
    getDistinctPlanningMonths,
    insertPlanning,
    updatePlanning,
    deletePlanning,

    getTrainers,
    getTrainerFilterOptions,
    getTrainerNames,
};