import camelcase from 'camelcase';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLType,
  GraphQLNonNull,
} from 'graphql';
import pluralize from 'pluralize';

import { EntryPointBuilder } from '../../../@types';
import { GraphQLJSONObject } from 'graphql-type-json';

/** This generates the default `Query` block of the schema. */
export const DEFAULT_ENTRY_POINTS: EntryPointBuilder = (types) => ({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: Object.entries(types).reduce(
      (prevResult: any, [typeName, type]: [string, GraphQLType]) => {
        const pluralTypeName = camelcase(pluralize(typeName));
        return {
          ...prevResult,
          [pluralTypeName + 'Page']: {
            type: new GraphQLNonNull(
              new GraphQLObjectType({
                name: `${pluralize(typeName)}Page`,
                fields: {
                  //@ts-expect-error
                  data: { type: new GraphQLNonNull(new GraphQLList(type)) },
                  total: { type: new GraphQLNonNull(GraphQLInt) },
                  limit: { type: new GraphQLNonNull(GraphQLInt) },
                  skip: { type: new GraphQLNonNull(GraphQLInt) },
                },
              })
            ),
            args: {
              query: { type: GraphQLJSONObject },
            },
          },
          [camelcase(typeName)]: {
            type,
            args: {
              id: { type: GraphQLString },
            },
          },
        };
      },
      {}
    ),
  }),
});

export const err = (msg: string, propName?: string | null): Error =>
  new Error(
    `jsonschema2graphql: ${propName ? `Couldn't convert property ${propName}. ` : ''
    }${msg}`
  );

type Func<T, U> = (arg: T) => U;

export function compose<T, U>(...fns: Array<Func<T, U>>): Func<T, U> {
  return function (x: T): U {
    return fns.reduceRight((acc: any, fn: Func<T, any>) => fn(acc), x);
  };
}

export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'string' || value instanceof String) {
    return value.trim().length === 0;
  }

  return false;
}

export type KeyFunc<T> = (value: T) => string;

export function keyBy<T>(array: T[], keyFunc: KeyFunc<T>): Record<string, T> {
  return array.reduce((result, value) => {
    const key = keyFunc(value);
    return {
      ...result,
      [key]: value,
    };
  }, {});
}

export function includes<T>(array: T[], value: T): boolean {
  return array.indexOf(value) !== -1;
}

export function toUpperCamelCase(input: string): string {
  const stripped = input.replace(/[^0-9a-zA-Z]+/g, ' ');
  return stripped
    .split(/[-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

type MapFunc<T, U> = (value: T, key: string) => U;

export function mapValues<T, U>(
  obj: Record<string, T>,
  fn: MapFunc<T, U>
): Record<string, U> {
  const result: Record<string, U> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const trimmedKey = key.trim();
      const value = obj[key];
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      result[trimmedKey] = fn(trimmedValue as T, trimmedKey);
    }
  }

  return result;
}

export function pick<T extends object, K extends keyof T>(
  keys: K[],
  obj: T
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (obj?.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
