export const PlanningType = {
  KLEUTERS: 'kleuters',
  GEZAMENLIJK: 'gezamenlijk',
  JEUGD: 'jeugd',
  VOLWASSENEN: 'volwassenen',
  WEDSTRIJDEN: 'wedstrijden',
} as const;

export type PlanningType = (typeof PlanningType)[keyof typeof PlanningType];

export const PlanningTypeLabel = {
  [PlanningType.KLEUTERS]: 'Kleuters',
  [PlanningType.GEZAMENLIJK]: 'Gezamenlijk',
  [PlanningType.JEUGD]: 'Jeugd',
  [PlanningType.VOLWASSENEN]: 'Volwassenen',
  [PlanningType.WEDSTRIJDEN]: 'Wedstrijden',
} as const;

export type PlanningTypeLabel = (typeof PlanningTypeLabel)[keyof typeof PlanningTypeLabel];
