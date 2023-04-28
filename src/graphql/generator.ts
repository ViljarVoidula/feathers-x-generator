import { cwd } from 'process';
import { getFullSchema } from './schema-loader';
import path from 'path';
import pluralize from 'pluralize';

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

let schemaResult;

const freshRoot = `
import { HookContext } from '@feathersjs/feathers';
import { Koa } from '@feathersjs/koa/lib';
import { GraphQLResolveInfo } from 'graphql';

// formatting __ keys to valid feathers query
function formatQuery(query: Record<string, any>): Record<string, any> {
  if (typeof query !== "object" || query === null) {
      return query;
  }

  if (Array.isArray(query)) {
      return query.map(formatQuery);
  }

  const feathersQuery: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
      const newKey = key.startsWith("__") ? "$" + key.slice(2) : key;
      feathersQuery[newKey] = formatQuery(value);
  }

  return feathersQuery;
}


export const rootResolver = {
    Query: {
        //!code graphql_query_resolvers end
    },
    Mutation: {
        //!code graphql_mutation_resolvers end
    },
        //!code graphql_type_resolvers end
}
`;
const buildQueryResolver = (resolverName: string, service: string) => {
  const page = resolverName.match(/Page$/);

  let innerTemplate = page
    ? `const query = { ...formatQuery(args?.query ?? {}), $limit: args?.query?.$limit ?? 50, $skip: args?.query?.$skip ?? 0 }\n            const data = await context.app.service('${pluralize(service).toLocaleLowerCase()}').find({ query: { ...formatQuery(query ?? {}) }, ...feathers });
  `
    : `const { id } = args;\n            const data = await context.app.service('${pluralize(service).toLocaleLowerCase()}').get(id, feathers);
  `;
  return `
        ${resolverName}: async (_parent: any, args: any, context: HookContext & Koa.Context, _info: GraphQLResolveInfo) => {
            const { feathers } = context;
            ${innerTemplate}  
            return data;
        },
        //!code graphql_query_resolvers end`;
};

class ServiceGenerator {
  name: string;
  description: string;
  config: any;
  constructor(config: any) {
    this.name = 'graphql';
    this.description = 'GraphQL generator';
    this.config = config;
    // set config path
    this.setSchema();
  }

  async setSchema() {
    await getFullSchema(
      path.normalize(
        process.cwd() + '/' + this.config.services_schema_path.replace('.', '')
      )
    ).then((result) => {
      schemaResult = result;
    });
  }

  get prompts() {
    return [
      {
        type: 'confirm',
        prefix: `
        _____________________________________________________________
       / To run the Graphql generator, make sure you have the         \\
       | .feathersx.config.json file.                                  |
       |                                                               |
       | NB: ".graphql.ts" files need to export valid schemas and      |
       \\ references in order to build the GraphQL service!             /
        -------------------------------------------------------------
               \\   ^__^
                \\  (oo)\\_______
                   (__)\\       )\\/\\
                       ||----w |
                       ||     ||
       `,
        name: 'generateResolvers',
        message:
          'Do you want to generate GraphQL resolvers for the services? (yes/no)',
      },
    ];
  }

  actions(data: any) {

    if (!data.generateResolvers) return []
    function buildServiceCall(method: string, service: string) {
      let call = `const result = await context.app.service('${service.toLowerCase()}').${method}`;
      if (method === 'create') {
        return call + `(data, feathers);`;
      } else if (method === 'patch') {
        return call + `(id, data, feathers);`;
      } else if (method === 'remove') {
        return call + `(id, feathers);`;
      } else if (method === 'find') {
        return call + `(query, feathers);`;
      } else if (method === 'get') {
        return call + `(id, feathers);`;
      }
      return call;
    }
    function buildArgs(method: string) {
      let args = '';
      if (method === 'create') {
        args = `const { data } = args;`;
      } else if (method === 'patch') {
        args = `const { id, data } = args;`;
      } else if (method === 'remove') {
        args = `const { id } = args;`;
      } else if (method === 'find') {
        args = `const { query } = args;`;
      } else if (method === 'get') {
        args = `const { id } = args;`;
      }

      return args;
    }
    function buildResolverArgs(method: string) {
      let args = '';
      if (method === 'create') {
        args = `data: any`;
      } else if (method === 'patch') {
        args = `id: string, data: any`;
      } else if (method === 'remove') {
        args = `id: string`;
      } else if (method === 'find') {
        args = `query: any`;
      } else if (method === 'get') {
        args = `id: string`;
      }

      return args;
    }

    const mutations = schemaResult.mutationResolverGeneratorEntries.map(
      (entry) => {
        const method = entry.match(/^[^A-Z]*/)[0];
        const service = `${entry.match(/[A-Z].*/)[0]}s`;
        return {
          type: 'modify',
          path: '{{graphQLOutputPath}}/resolvers.ts',
          transform: (fileContents) => {
            const resolver = `\n        ${entry}: async (_parent: any, args: { ${buildResolverArgs(method)} }, context: HookContext & Koa.Context, _info: GraphQLResolveInfo) => {\n            const { feathers } = context;\n            ${buildArgs(
              method
            )}\n            ${buildServiceCall(
              method,
              service
            )}\n\n            return result;\n        },\n        //!code graphql_mutation_resolvers end`;
            const regex = new RegExp(
              `(?<!${resolver})\/\/!code graphql_mutation_resolvers end`,
              'gm'
            );
            const modifiedContents = fileContents.replace(regex, resolver);
            return modifiedContents;
          },
        };
      }
    );

    const queries = schemaResult.queryResolverGeneratorEntries.map((entry) => {
      const service = `${entry.match(/^[^A-Z]*/)[0]}`;
      return {
        type: 'modify',
        path: '{{graphQLOutputPath}}/resolvers.ts',
        transform: (fileContents) => {
          const resolver = buildQueryResolver(entry, service);
          const regex = new RegExp(
            `(?<!${resolver})\/\/!code graphql_query_resolvers end`,
            'gm'
          );
          const modifiedContents = fileContents.replace(regex, resolver);
          return modifiedContents;
        },
      };
    });
    const groupByRootId = groupBy('root_id')
    const referenceRoots = groupByRootId(schemaResult.typeReferenceEntries)
    const referenceRootTypes = Object.keys(referenceRoots).map((entry) => {
      return {
        type: 'append',
        path: '{{graphQLOutputPath}}/resolvers.ts',
        pattern: `//!code graphql_type_resolvers end`,
        template: `    ${entry}: {\n        //!code graphql_${entry}_resolvers end\n    },\n`

      }
    })

    const referencFieldResolvers = Object.entries(schemaResult.typeReferenceEntries).map(([key, value]: any) => {
      const field = value.type === 'array' ? value.path.match(/(?<=\.)[^.\n]*(?=\.|^)/) : value.parent_key;

      return {
        type: 'append',
        path: '{{graphQLOutputPath}}/resolvers.ts',
        pattern: `//!code graphql_${value.root_id}_resolvers end`,
        template: `
        ${field}: async (parent: any, args: any, context: HookContext & Koa.Context, _info: GraphQLResolveInfo) => {
          const { feathers } = context;
          ${value.path.match(/items/) ? `const { ${value.key_field} = [] } = parent;
          const query = { ...formatQuery(args?.query ?? {}), $limit: args?.query?.$limit ?? 50, $skip: args?.query?.$skip ?? 0 }
          const data = await context.app.service('${pluralize(value.key).toLowerCase()}').find({ query: {...query, ${value.key_field}: { $in: ${value.key_field} } }, ...feathers});

          return data;`: `const { ${value.key_field} } = parent;
          const data = await context.app.service('${pluralize(value.key).toLowerCase()}').get(${value.key_field}, ...feathers);

          return data;
          `}
        },`
      }
    })


    return [
      {
        type: 'add',
        path: '{{graphQLOutputPath}}/authentication/index.ts',
        skipIfExists: true,
        templateFile: 'graphql/templates/authentication.hbs',
      },
      {
        type: 'add',
        path: '{{graphQLOutputPath}}/index.ts',
        skipIfExists: true,
        templateFile: 'graphql/templates/index.hbs',
      },
      {
        type: 'add',
        path: '{{graphQLOutputPath}}/resolvers.ts',
        force: true,
        template: freshRoot,
      },

      {
        type: 'add',
        path: '{{graphQLOutputPath}}/typeDef.ts',
        template: `\nexport const rootTypeDef =\`#graphql\n${schemaResult.fullSchema}\``,
        force: true,
      },
      ...mutations,
      ...queries,
      ...referenceRootTypes,
      ...referencFieldResolvers

    ];
  }
}

export default (() => {
  return ServiceGenerator;
})();
