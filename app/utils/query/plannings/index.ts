import { get } from './get';
import { upsert } from './upsert';
import { remove } from './remove';
import { generateRouter } from './generate';

export const planningsRouter = {
  get,
  upsert,
  remove,
  generate: generateRouter,
};
