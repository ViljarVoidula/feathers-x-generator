

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

const regex = /\/\/\!code extended_graphql_schema\sstart([\s\S]*?)\/\/\!code extended_graphql_schema\send$/g;
const importSchemas = async (directory: string): Promise<SchemaImports> => {
  const schemaImports: SchemaImports = {};
  const readDirectory = async (dirPath: string): Promise<void> => {
    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);
 
      if (stats.isDirectory()) {
        await readDirectory(filePath);
      } else if (/\.graphql\.(ts|js)$/.test(file)) {
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
    const mutationResolverGeneratorEntries = Object.keys(schemas).map((key) => Object.keys(schemas[key].mutationConfiguration).map(method=>`${method}${pluralize.singular(key)}`)).flat(2);
    const queryResolverGeneratorEntries = Object.keys(schemas).map((key) => [`${pluralize.singular(camelcase(key))}`, `${camelcase(key)}Page`]).flat(2);

    return {
      fullSchema: printSchema(buildMutationType(schemas, querySchema)).replace(/`([^`]+)`/g, '"$1"'),
      mutationResolverGeneratorEntries,
      queryResolverGeneratorEntries
    };
  });
}
