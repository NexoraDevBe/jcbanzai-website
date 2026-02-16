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
    In_judovlaanderen: boolean,
    Vergunning: number,
    Voornaam: string,
    Naam: string,
    Straat: string,
    Postcode: string,
    Gemeente: string,
    Gsm: string,
    Gsm2_Telefoon: string,
    Emails: string[],
    Geslacht: string,
    Geboorte_datum: string,
    Nationaliteit: string,
    Graad: string,
    Actief: boolean,
    Vergunning_geldig_tot: string,
    Wedstrijd_training: string,
    Dojos: string[],
    Lidgeld_opmerkingen: string,
    Gordel_behaald_op: string,
    Behaald_examen: string,
    Door_wie_examen: string,
    Datum_examen: string,
    updated_at: string,
}

interface Planning {
    id: number
    day: string
    type: 'jeugd' | 'volwassenen' | 'gezamenlijk' | 'wedstrijd' | 'kleuters'
    beschikbaar: string[]
    planning: string[]
    updated_at: string,
}

interface Trainer {
    id: number
    Voornaam: string
    Naam: string
    Gsm: string
    Email: string
    Check_strafregister: string,
    Check_door: string,
    Straat: string,
    Gemeente: string,
    Postcode: string,
    Titels: string[]
}

interface UserData {
    user: User | null,
    session: Session | null,
    role: string | null,
}

interface Column {
    key: string
    label: string
    type?: 'text' | 'checkbox' | 'date' | 'select' | 'array-text' | 'array-select' | 'array-select-horizontal' | 'readonly'
    options?: Array<{ value: string | number; label: string }>
    className?: string
    disabled?: (row: any) => boolean
    sticky?: boolean
}

export type {
    Technique,
    Member,
    Planning,
    Trainer,
    UserData,
    Column,
}