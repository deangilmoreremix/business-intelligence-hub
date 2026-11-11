import camelCase from 'lodash.camelcase';
import { capitalize } from '..';

export const pascalCase = (str: string) => capitalize(camelCase(str));
