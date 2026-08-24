import { membersRouter } from './members';
import { planningsRouter } from './plannings';
import { techniquesRouter } from './techniques';

export const api = {
  members: membersRouter,
  plannings: planningsRouter,
  techniques: techniquesRouter,
};
