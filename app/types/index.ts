import type {Session, User} from "@supabase/supabase-js";

interface Technique {
    name: string,
    belt: string,
    category: string,
    translation: string,
    video: string,
    id: number
}

interface UserData {
    user: User | null,
    session: Session | null,
    role: string | null,
}

export type {
    Technique,
    UserData
}