export const Belt = {
  UNKNOWN: '',
  WHITE: 'white',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  GREEN: 'green',
  BLUE: 'blue',
  BROWN: 'brown',
  BLACK: 'black',
} as const;

export type Belt = (typeof Belt)[keyof typeof Belt];

export const BeltLabel = {
  [Belt.UNKNOWN]: 'Onbekend',
  [Belt.WHITE]: 'Wit',
  [Belt.YELLOW]: 'Geel',
  [Belt.ORANGE]: 'Oranje',
  [Belt.GREEN]: 'Groen',
  [Belt.BLUE]: 'Blauw',
  [Belt.BROWN]: 'Bruin',
  [Belt.BLACK]: 'Zwart',
} as const;
