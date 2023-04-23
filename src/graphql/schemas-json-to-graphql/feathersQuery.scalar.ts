import { GraphQLScalarType, Kind } from 'graphql';

type FeathersQueryOperators =
  | '$eq'
  | '$ne'
  | '$gt'
  | '$gte'
  | '$lt'
  | '$lte'
  | '$in'
  | '$nin'
  | '$null'
  | '$regex'
  | '$search'
  | '$autocomplete'
  | '$similar'
  | '$not';

type FeathersQuery = {
  [key: string]: any | FeathersQuery;
};

const isFeathersQueryOperator = (value: any): value is FeathersQueryOperators => {
  return typeof value === 'string' && value.startsWith('$');
};

const isFeathersQuery = (value: any): value is FeathersQuery => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  for (const key in value) {
    const val = value[key];
    if (typeof val === 'object' && !isFeathersQuery(val) && !isFeathersQueryOperator(key)) {
      return false;
    }
  }
  return true;
};

export const FeathersQueryScalar = new GraphQLScalarType({
  name: 'FeathersQuery',
  description: 'Custom scalar type representing FeathersJS query object',
  serialize(value: FeathersQuery | any) {
    if (isFeathersQuery(value)) {
      return value;
    }
    throw new TypeError(`Value is not a valid FeathersJS query object: ${value}`);
  },
  parseValue(value: any) {
    if (isFeathersQuery(value)) {
      return value;
    }
    throw new TypeError(`Value is not a valid FeathersJS query object: ${value}`);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const value = {};
      ast.fields.forEach((field) => {
        const fieldValue = this.parseLiteral!(field.value);
        //@ts-ignore
        value[field.name.value] = fieldValue;
      });
      return value as FeathersQuery;
    } else {
    }
    throw new TypeError(`Value is not a valid FeathersJS query object`);
  }
});
