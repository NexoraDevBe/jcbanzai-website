import type {Session, User} from "@supabase/supabase-js";

interface Technique {
    name: string,
    belt: string,
    category: string,
    translation: string,
    video: string,
    id: number
}

interface Member {
    id: number,
    in_judovlaanderen: boolean,
    vergunning: number,
    voornaam: string,
    naam: string,
    straat: string,
    postcode: string,
    gemeente: string,
    gsm: string,
    telefoon: string,
    emails: string[],
    geslacht: string,
    geboorte_datum: string,
    nationaliteit: string,
    graad: string,
    actief: boolean,
    vergunning_geldig_tot: string,
    wedstrijd_training: string,
    dojos: string[],
    lidgeld_opmerkingen: string,
    gordel_behaald_op: string,
    behaald_examen: string,
    door_wie_examen: string,
    datum_examen: string,
    updated_at: string,
    created_at: string,
}

interface Planning {
    id: number
    day: string
    type: 'jeugd' | 'volwassenen' | 'gezamenlijk' | 'wedstrijd' | 'kleuters' | 'geen-les'
    beschikbaar: string[]
    planning: string[]
    updated_at: string,
}

interface Trainer {
    id: number
    voornaam: string
    naam: string
    gsm: string
    email: string
    check_strafregister: string,
    check_door: string,
    straat: string,
    gemeente: string,
    postcode: string,
    titels: string[]
}

interface UserData {
    user: User | null,
    session: Session | null,
    role: string | null,
}

interface Column {
    key: string
    label: string
    type?: 'text' | 'textarea' | 'checkbox' | 'date' | 'select' | 'array-text' | 'array-select' | 'array-select-horizontal' | 'readonly'
    options?: Array<{ value: string | number; label: string }>
    className?: string
    disabled?: (row: any) => boolean
    sticky?: boolean
}

interface News {
    id: number
    title: string
    description: string
    post: boolean
    pinned: boolean
    alert: boolean
    alert_end_date: string
    date: string
    img_url: string
    created_at: string
}

export type {
    Technique,
    Member,
    Planning,
    Trainer,
    UserData,
    Column,
    News,
}