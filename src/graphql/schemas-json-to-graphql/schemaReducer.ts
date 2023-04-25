import Ajv from 'ajv';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql';
import { JSONSchema7 } from 'json-schema';
import { GraphQLTypeMap } from '../../../@types';
import { getTypeName } from './getTypeName';
import { graphqlSafeEnumKey } from './graphqlSafeEnumKey';
import { err, isEmpty, toUpperCamelCase, mapValues, keyBy } from './helpers';
import { GraphQLJSONObject } from 'graphql-type-json';
/** Maps basic JSON schema types to basic GraphQL types */
const BASIC_TYPE_MAPPING = {
  string: GraphQLString,
  integer: GraphQLInt,
  number: GraphQLFloat,
  boolean: GraphQLBoolean,
};

export function schemaReducer(knownTypes: GraphQLTypeMap, schema: JSONSchema7) {
  // validate against the json schema schema
  new Ajv().validateSchema(schema);

  const $id = schema.$id;

  if ($id === undefined) throw err('Schema does not have an `$id` property.');
  const typeName = getTypeName($id);

  // definitions
  const { definitions } = schema;
  for (const definedTypeName in definitions) {
    const definedSchema = definitions[definedTypeName] as JSONSchema7;
    knownTypes[definedTypeName] = buildType(
      definedTypeName,
      definedSchema,
      knownTypes,
      schema
    );
  }

  knownTypes[typeName] = buildType(typeName, schema, knownTypes, schema);
  return knownTypes;
}

function buildType(
  propName: string,
  schema: JSONSchema7,
  knownTypes: GraphQLTypeMap,
  rootSchema?: JSONSchema7
): GraphQLType {
  const name = toUpperCamelCase(propName);

  // oneOf?
  if (schema.oneOf) {
    const cases = schema.oneOf as JSONSchema7;
    const caseKeys = Object.keys(cases);
    const types: GraphQLObjectType[] = caseKeys.map((caseName: string) => {
      const caseSchema = cases[caseName];
      const qualifiedName = `${name}_${caseName}`;
      const typeSchema = (caseSchema.then || caseSchema) as JSONSchema7;
      return buildType(
        qualifiedName,
        typeSchema,
        knownTypes
      ) as GraphQLObjectType;
    });
    const description = buildDescription(schema);
    return new GraphQLUnionType({ name, description, types });
  }

  // object?
  else if (schema.type === 'object') {
    const description = buildDescription(schema);

    if (!schema.properties) {
      return GraphQLJSONObject;
    }
    const fields = () =>
      !isEmpty(schema.properties)
        ? mapValues(
          //@ts-ignore
          schema?.properties ?? {},
          (prop: JSONSchema7, fieldName: string) => {
            const qualifiedFieldName = `${name}.${fieldName}`;
            const type = buildType(
              qualifiedFieldName,
              prop,
              knownTypes
            ) as GraphQLObjectType;
            const isRequired = schema?.required?.includes(fieldName);

            return {
              type: isRequired ? new GraphQLNonNull(type) : type,
              //@ts-expect-error
              ...(prop.items?.$ref ? {
                args: {
                  query: { type: GraphQLJSONObject },
                }
              } : {}),
              description: buildDescription(prop),
            };
          }
        )
        : // GraphQL doesn't allow types with no fields, so put a placeholder
        { _empty: { type: GraphQLString } };

    return new GraphQLObjectType({ name, description, fields });
  }

  // array?
  else if (schema.type === 'array') {
    const elementType = buildType(
      name,
      schema.items as JSONSchema7,
      knownTypes
    );
    return new GraphQLList(new GraphQLNonNull(elementType));
  }

  // enum?
  else if (schema.enum) {
    if (schema.type !== 'string')
      throw err(`Only string enums are supported.`, name);
    const description = buildDescription(schema);
    //@ts-ignore
    const graphqlToJsonMap = keyBy(schema.enum, graphqlSafeEnumKey);
    const values = mapValues(graphqlToJsonMap, (value: string) => ({ value }));
    const enumType = new GraphQLEnumType({ name, description, values });
    return enumType;
  }

  // ref?
  else if (schema.$ref) {
    const ref = getTypeName(schema.$ref);
    const type = knownTypes[ref];
    if (!type) throw err(`The referenced type ${ref} is unknown.`, name);
    return type;
  }

  // basic?
  else if (BASIC_TYPE_MAPPING[schema.type as string]) {
    return BASIC_TYPE_MAPPING[schema.type as string];
  }

  // ¯\_(ツ)_/¯
  else throw err(`The type ${schema.type} on property ${name} is unknown.`);
}

function buildDescription(d: any): string | undefined {
  if (d.title && d.description) return `${d.title}: ${d.description}`;
  return d.title || d.description || undefined;
}
