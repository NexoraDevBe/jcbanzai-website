export const PlanningType = {
  KLEUTERS: 'kleuters',
  JEUGD: 'jeugd',
  GEZAMENLIJK: 'gezamenlijk',
  VOLWASSENEN: 'volwassenen',
  WEDSTRIJD: 'wedstrijd',
  GEEN_LES: 'geen-les',
} as const;

export type PlanningType = (typeof PlanningType)[keyof typeof PlanningType];

export const PlanningTypeLabel = {
  [PlanningType.KLEUTERS]: 'Kleuters',
  [PlanningType.JEUGD]: 'Jeugd',
  [PlanningType.GEZAMENLIJK]: 'Gezamenlijk',
  [PlanningType.VOLWASSENEN]: 'Volwassenen',
  [PlanningType.WEDSTRIJD]: 'Wedstrijd',
  [PlanningType.GEEN_LES]: 'Geen les',
} as const;

export type PlanningTypeLabel = (typeof PlanningTypeLabel)[keyof typeof PlanningTypeLabel];

export const PlanningTypeOrder: PlanningType[] = [
  PlanningType.KLEUTERS,
  PlanningType.JEUGD,
  PlanningType.GEZAMENLIJK,
  PlanningType.VOLWASSENEN,
  PlanningType.WEDSTRIJD,
];

interface WeeklySchedule {
  day: number;
  type: PlanningType;
}

export const WeekSchedule: WeeklySchedule[] = [
  { day: 1, type: PlanningType.JEUGD },
  { day: 1, type: PlanningType.VOLWASSENEN },
  { day: 3, type: PlanningType.WEDSTRIJD },
  { day: 4, type: PlanningType.JEUGD },
  { day: 4, type: PlanningType.VOLWASSENEN },
  { day: 0, type: PlanningType.KLEUTERS },
  { day: 0, type: PlanningType.GEZAMENLIJK },
];
