export const Geslacht = {
  MAN: 'M',
  VROUW: 'V',
} as const;

export type Geslacht = (typeof Geslacht)[keyof typeof Geslacht];

export const GeslachtLabel = {
  [Geslacht.MAN]: 'Man',
  [Geslacht.VROUW]: 'Vrouw',
} as const;

export type GeslachtLabel = (typeof Geslacht)[keyof typeof Geslacht];

export const Graad = {
  BEGINNER: '01-Beginner',
  SIXTH_KYU: '02-Kyu 6',
  FIFTH_KYU: '03-Kyu 5',
  FOURTH_KYU: '04-Kyu 4',
  THIRD_KYU: '05-Kyu 3',
  SECOND_KYU: '06-Kyu 2',
  FIRST_KYU: '07-Kyu 1',
  FIRST_DAN: '08-Dan 1',
  SECOND_DAN: '09-Dan 2',
  THIRD_DAN: '10-Dan 3',
  FOURTH_DAN: '11-Dan 4',
  FIFTH_DAN: '12-Dan 5',
  SIXTH_DAN: '13-Dan 6',
  SEVENTH_DAN: '14-Dan 7',
  EIGHTH_DAN: '15-Dan 8',
  NINTH_DAN: '16-Dan 9',
  TENTH_DAN: '17-Dan 10',
} as const;

export type Graad = (typeof Graad)[keyof typeof Graad];

export const GraadLabel = {
  [Graad.BEGINNER]: 'Beginner',
  [Graad.SIXTH_KYU]: '6e Kyu - wit',
  [Graad.FIFTH_KYU]: '5e Kyu - geel',
  [Graad.FOURTH_KYU]: '4e Kyu - oranje',
  [Graad.THIRD_KYU]: '3e Kyu - groen',
  [Graad.SECOND_KYU]: '2e Kyu - blauw',
  [Graad.FIRST_KYU]: '1e Kyu - bruin',
  [Graad.FIRST_DAN]: '1e Dan - zwart',
  [Graad.SECOND_DAN]: '2e Dan',
  [Graad.THIRD_DAN]: '3e Dan',
  [Graad.FOURTH_DAN]: '4e Dan',
  [Graad.FIFTH_DAN]: '5e Dan',
  [Graad.SIXTH_DAN]: '6e Dan',
  [Graad.SEVENTH_DAN]: '7e Dan',
  [Graad.EIGHTH_DAN]: '8e Dan',
  [Graad.NINTH_DAN]: '9e Dan',
  [Graad.TENTH_DAN]: '10e Dan',
} as const;

export type GraadLabel = (typeof GraadLabel)[keyof typeof GraadLabel];

export const Dojo = {
  GAVERE: 'Gavere',
  NAZARETH: 'Nazareth',
} as const;

export type Dojo = (typeof Dojo)[keyof typeof Dojo];
