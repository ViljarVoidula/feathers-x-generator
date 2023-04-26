import { pick, toUpperCamelCase } from './schemas-json-to-graphql/helpers';
import {
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLSchema,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  lexicographicSortSchema,
  TypeDefinitionNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  buildASTSchema,
  parse,
  printSchema,
  Kind,
  DocumentNode,
} from 'graphql';
import pluralize from 'pluralize';
import { GraphQLJSONObject } from 'graphql-type-json';
import camelcase from 'camelcase';
type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'undefined'
  | 'any'
  | 'ID';
//@ts-ignore
export function jsonSchemaTypeToGraphQLType(
  jsonType: JsonSchemaType | JsonSchemaType[],
  isRequired = false
) {
  let graphQLType;
  if (Array.isArray(jsonType)) {
    // For union types, we return GraphQLString as a fallback type
    //@ts-ignore
    graphQLType = jsonType.reduce(
      (acc, curr) => acc || jsonSchemaTypeToGraphQLType(curr),
      null
    );
  } else {
    switch (jsonType) {
      case 'string':
        graphQLType = GraphQLString;
        break;
      case 'number':
        graphQLType = GraphQLFloat;
        break;
      case 'integer':
        graphQLType = GraphQLInt;
        break;
      case 'boolean':
        graphQLType = GraphQLBoolean;
        break;
      case 'object':
        graphQLType = GraphQLJSONObject; // GraphQL doesn't have a direct equivalent to this type, so we use a custom scalar type
        break;
      case 'array':
        graphQLType = new GraphQLList(GraphQLString);
        break;
      case 'null':
      case 'undefined':
        graphQLType = null; // GraphQL doesn't have a direct equivalent to these types
        break;
      case 'any':
        graphQLType = GraphQLString; // GraphQL doesn't have an "any" type, so we default to String
        break;
      case 'ID':
        graphQLType = GraphQLID;
        break;
      default:
        graphQLType = null; // Unknown or unsupported type
    }
  }

  if (isRequired) {
    //@ts-ignore
    graphQLType = new GraphQLNonNull(graphQLType);
  }

  return graphQLType;
}

const inputTypeCache: Map<string, GraphQLInputType> = new Map()
const visitedTypes: Set<GraphQLObjectType<any, any>> = new Set()
function fieldsToInputType(
  fields: GraphQLInputFieldConfigMap,
  name: string,
  jsonSchema: any,
): GraphQLInputObjectType {
  const inputFields: GraphQLInputFieldConfigMap = {};


  function fieldTypeToInputType(fieldType: GraphQLInputType): GraphQLInputType {
    if (fieldType instanceof GraphQLNonNull) {
      const innerType = fieldTypeToInputType(fieldType.ofType);
      return getCachedType(new GraphQLNonNull(innerType));
    } else if (fieldType instanceof GraphQLList) {
      const innerType = fieldTypeToInputType(fieldType.ofType);
      return getCachedType(new GraphQLList(innerType));
    } else if (fieldType instanceof GraphQLObjectType) {
      if (visitedTypes.has(fieldType)) {
        // If object type has already been visited, return the cached input type
        const cachedType = getCachedType(new GraphQLInputObjectType({
          name: `${fieldType.name}Input`,
          fields: inputFields,
        }));

        return cachedType;
      } else {
        // Otherwise, visit the object type and create a new input type based on its fields
        visitedTypes.add(fieldType);
        //@ts-ignore
        const inputType = fieldsToInputType(fieldType.getFields(), `${fieldType.name}Input`, visitedTypes);
        visitedTypes.delete(fieldType);
  
        return getCachedType(inputType) ?? inputType;
      }
    } else {
      return fieldType;
    }
  }


  function getCachedType(type: GraphQLInputType): GraphQLInputType {
    const typeName = type.toString();
    if (inputTypeCache.has(typeName)) {
      return inputTypeCache.get(typeName)!;
    } else {
      inputTypeCache.set(typeName, type);
      return type;
    }
  }


  for (const fieldName in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
      if (jsonSchema && jsonSchema?.properties?.[fieldName] && jsonSchema?.properties?.[fieldName]?.$ref) {
        // skip $ref fields
        continue;
      }
      if (jsonSchema.properties && jsonSchema.properties[fieldName] && jsonSchema.properties[fieldName]?.items?.$ref) {
        // skip $ref fields
        continue;
      }
      const field = fields[fieldName];
      const fieldType = field.type;
      const inputFieldType = fieldTypeToInputType(fieldType);
      inputFields[fieldName] = {
        type: inputFieldType,
      };
    }
  }
  return new GraphQLInputObjectType({
    name,
    fields: inputFields,
  });
}


function sortSchema(schema: GraphQLSchema) {
  const schemaString = printSchema(schema);
  const ast = parse(schemaString);
  const types: TypeDefinitionNode[] = [];
  const scalars: TypeDefinitionNode[] = [];
  const operations: (OperationDefinitionNode | FragmentDefinitionNode)[] = [];

  // Iterate over the document AST and separate type definitions and operations
  for (const definition of ast.definitions) {
    if (
      definition.kind === Kind.OPERATION_DEFINITION ||
      definition.kind === Kind.FRAGMENT_DEFINITION
    ) {
      operations.push(definition);
    }
    if (definition.kind === Kind.SCALAR_TYPE_DEFINITION) {
      scalars.push(definition);
    } else if (
      definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
      definition.kind === Kind.INTERFACE_TYPE_DEFINITION ||
      definition.kind === Kind.UNION_TYPE_DEFINITION ||
      definition.kind === Kind.ENUM_TYPE_DEFINITION ||
      definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
    ) {
      types.push(definition);
    }
  }

  // Build a new document AST with the types and operations separated
  const newAst: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [...operations, ...scalars, ...types],
  };

  // Build a new schema using the modified document AST
  const newSchema = buildASTSchema(newAst);

  // Return the sorted schema as a string
  return newSchema;
}
//@ts-ignore
export function buildMutationType(schemas, querySchema) {
  // go over the schemas and filter the ones that have a mutationConfiguration
  let inputs = [];
  for (const key in schemas) {
    if (schemas[key].mutationConfiguration) {
      const { mutationConfiguration } = schemas[key];
      for (const method of Object.keys(mutationConfiguration)) {
        const keys = mutationConfiguration[method].keys;
        const typeMap = querySchema.getTypeMap();
        const field = method + schemas[key].extendedSchema.$id;
        const extractedReturnType = field.replace(/create|patch|remove/, '');
        const typeFields =
          typeMap[pluralize.singular(extractedReturnType)].getFields();

        const fields = /remove/.test(field)
          ? {
            id: { type: new GraphQLNonNull(GraphQLID) },
          }
          : pick(keys, { ...typeFields });

        inputs.push(
          //@ts-ignore
          fieldsToInputType(fields, toUpperCamelCase(pluralize.singular(field)), schemas[key].extendedSchema)
        );
      }
    }
  }

  const mutationFields = inputs.map((input) => {
    const typeMap = querySchema.getTypeMap();
    //@ts-ignore
    const field = input.name;
    const extractedReturnType = field.replace(/Create|Patch|Remove/, '');
    const type = typeMap[pluralize.singular(extractedReturnType)];
    let args = {};

    if (field.match(/Create/)) {
      args = {
        data: { type: new GraphQLNonNull(input) },
      };
    } else if (field.match(/Patch/)) {
      args = {
        id: { type: new GraphQLNonNull(GraphQLID) },
        data: { type: new GraphQLNonNull(input) },
      };
    } else if (field.match(/Remove/)) {
      args = {
        id: { type: new GraphQLNonNull(GraphQLID) },
      };
    }

    return {
      [camelcase(pluralize.singular(field))]: {
        type,
        args,
      },
    };
  });

  return sortSchema(
    new GraphQLSchema({
      query: querySchema.getQueryType(),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutationFields.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      }),
      types: [...inputs],
    })
  );
}
