

import convert from './schemas-json-to-graphql';
import { GraphQLSchema, printSchema } from 'graphql';
import { buildMutationType } from './full-schema-converter';
import camelcase from 'camelcase';
import pluralize from 'pluralize';

const fs = require('fs')
const path = require('path')

interface SchemaImports {
  [key: string]: any;
}
interface RefKey {
  path: string;
  key: string;
  type: string;
  key_field?: string;
  parent_key?: string;
  root_id: string;
}

const regex = /\/\/\!code extended_graphql_schema\sstart([\s\S]*?)\/\/\!code extended_graphql_schema\send$/gm;


function findRefs(obj: any, path: string[] = [], parentType = '', parentKey = '', rootId = ''): RefKey[] {
  let results: RefKey[] = [];

  if (obj.$id) {
    rootId = obj.$id;
  }

  for (let key in obj) {
    if (key === '$ref') {
      results.push({ path: path.join('.'), key: obj[key], type: parentType, key_field: obj['key_field'], parent_key: parentKey, root_id: rootId });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      let type = obj.type || parentType;
      let key_field = obj['key_field'];

      results = results.concat(findRefs(obj[key], [...path, key], type, key, rootId));

      // If this object has a special key_field and its value is an object,
      // also search for refs in the value of the key_field
      if (key_field && typeof obj[key_field] === 'object' && obj[key_field] !== null) {
        results = results.concat(findRefs(obj[key_field], [...path, key, key_field], type, key, rootId));
      }
    }
  }

  return results;
}

const importSchemas = async (directory: string): Promise<SchemaImports> => {
  const schemaImports: SchemaImports = {};
  const readDirectory = async (dirPath: string): Promise<void> => {
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        await readDirectory(filePath);
      } else if (file.match(/\.graphql\.ts$/)) {

        const contents = await fs.promises.readFile(filePath, 'utf8');
        const matches = contents.match(regex);

        if (matches) {
          const name = path.basename(path.dirname(filePath)).replace(/^[a-z]/, (_name) => _name.toUpperCase());
          const module = await import(filePath);
          const { extendedSchema, mutationConfiguration = undefined } = module;

          schemaImports[name] = {
            extendedSchema,
            mutationConfiguration
          };
        }
      }
    }
  };

  await readDirectory(directory);

  return schemaImports;
};

export async function getFullSchema(servicesPath = path.join(__dirname, '../../assets')): Promise<any> {
  return await importSchemas(servicesPath).then((schemas) => {
    const querySchema: GraphQLSchema = convert({ jsonSchema: Object.keys(schemas).map((key) => schemas[key].extendedSchema) });
    const mutationResolverGeneratorEntries = Object.keys(schemas).map((key) => Object.keys(schemas[key].mutationConfiguration).map(method => `${method}${pluralize.singular(key)}`)).flat(2);
    const queryResolverGeneratorEntries = Object.keys(schemas).map((key) => [`${pluralize.singular(camelcase(key))}`, `${camelcase(key)}Page`]).flat(2);
    const typeReferenceEntries = Object.keys(schemas).map((key) => schemas[key].extendedSchema).map((schema) => findRefs(schema)).flat(2);
    return {
      fullSchema: printSchema(buildMutationType(schemas, querySchema)).replace(/`([^`]+)`/g, '"$1"'),
      mutationResolverGeneratorEntries,
      queryResolverGeneratorEntries,
      typeReferenceEntries
    };
  });
}
