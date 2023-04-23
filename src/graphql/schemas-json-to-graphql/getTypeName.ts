import * as path from 'path';
import { toUpperCamelCase } from './helpers';

export const getTypeName = (s: string | undefined): string => {
  if (s === undefined) return '';
  return toUpperCamelCase(path.parse(s).name);
};
