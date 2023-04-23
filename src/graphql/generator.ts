import { cwd } from 'process';
import { getFullSchema } from './schema-loader';
import path from 'path';


let schemaResult;

const freshRoot = `
import { HookContext } from '@feathersjs/feathers';
import { Koa } from '@feathersjs/koa/lib';
import { GraphQLResolveInfo } from 'graphql';

export const rootResolver = {
    Query: {
        //!code graphql_query_resolvers end
    },
    Mutation: {
        //!code graphql_mutation_resolvers end
    }
}
`;
const buildQueryResolver = (resolverName: string, service: string) => {
  const page = resolverName.match(/Page$/);
  let innerTemplate = page ? `const { query } = args;\n            const data = await context.app.service('${service}').find({ query, ...feathers});
  `: `const { id } = args;\n            const data = await context.app.service('${service}').get(id, feathers);
  `
  return `
        ${resolverName}: async (_parent: any, args: any, context: HookContext & Koa.Context, info: GraphQLResolveInfo) => {
            const { feathers } = context;
            ${innerTemplate}  
            return data;
        },
        //!code graphql_query_resolvers end`;
}




class ServiceGenerator {
  name: string;
  description: string;
  config: any;
  constructor(config: any) {
    this.name = 'graphql';
    this.description = 'GraphQL generator';
    this.config = config;
    // set config path
    this.setSchema()
    
  }

  async setSchema(){
    await getFullSchema(path.normalize(process.cwd() +'/' + this.config.services_schema_path.replace('.', ''))).then((result) => {
      schemaResult = result;
    });
  }

  get prompts() {
    return [
      {
        type: 'confirm',
        name: 'generateResolvers',
        message: 'Do you want to generate GraphQL resolvers for the services? (yes/no)'
      },
    ];
  }

actions(data: any) {
    function buildServiceCall (method: string, service: string){
      let call = `const result = await context.app.service('${service.toLowerCase()}').${method}`
      if(method === 'create') {
        return  call + `(data, feathers);`
      }else if(method === 'patch') {
          return call +`(id, data, feathers);`
        }
      else if(method === 'remove') {
          return call +`(id, feathers);`
      }else if(method === 'find') {
          return call +`(query, feathers);`
      }else if  (method === 'get') {
        return call + `(id, feathers);`
      }
      return call;
    }
    function buildArgs (method: string){
      let args = ''
      if(method === 'create') {
          args = `const { data } = args;`
      }else if(method === 'patch') {
          args = `const { id, data } = args;`
      }
      else if(method === 'remove') {
          args = `const { id } = args;`
      }else if(method === 'find') {
          args = `const { query } = args;`
      }else if  (method === 'get') {
          args = `const { id } = args;`
      }

      return args;
    }
    // console.log(schemaResult.mutationResolverGeneratorEntries);
    const mutations = schemaResult.mutationResolverGeneratorEntries.map((entry) => {
      const method = entry.match(/^[^A-Z]*/)[0];
      const service = `${entry.match(/[A-Z].*/)[0]}s`;
      return {
        type: "modify",
        path: "{{outputPath}}/resolvers.ts",
        transform: (fileContents) => {
          const resolver =  `\n        ${entry}: async (_parent: any, args: { id?: string, data: any }, context: HookContext & Koa.Context, info: GraphQLResolveInfo) => {\n            const { feathers } = context;\n            ${buildArgs(method)}\n            ${buildServiceCall(method, service)}\n\n            return result;\n        },\n        //!code graphql_mutation_resolvers end`;
          const regex = new RegExp(`(?<!${resolver})\/\/!code graphql_mutation_resolvers end`, 'gm')
          const modifiedContents = fileContents.replace(
            regex,
            resolver
          );
          return modifiedContents;
        },
      }
    })

    const queries = schemaResult.queryResolverGeneratorEntries.map((entry) => {
      const service = `${entry.match(/[a-z].*/)[0]}`;
      return {
        type: "modify",
        path: "{{outputPath}}/resolvers.ts",
        transform: (fileContents) => {
          const resolver = buildQueryResolver(entry, service);
          const regex = new RegExp(`(?<!${resolver})\/\/!code graphql_query_resolvers end`, 'gm')
          const modifiedContents = fileContents.replace(
            regex,
            resolver
          );
          return modifiedContents;
        }
      }
    })
    return [
      {
        type: 'add',
        path: '{{outputPath}}/authentication/index.ts',
        skipIfExists: true,
        templateFile: 'graphql/templates/authentication.hbs',
      },
      {
        type: 'add',
        path: '{{outputPath}}/index.ts',
        skipIfExists: true,
        templateFile: 'graphql/templates/index.hbs',
      },
      {
        type: "add",
        path: "{{outputPath}}/resolvers.ts",
        force: true,
        template: freshRoot
        
      },

      {
        type: 'add',
        path: '{{outputPath}}/typeDef.ts',
        template: `\nexport const rootTypeDef =\`#graphql\n${schemaResult.fullSchema}\``,
        force: true
      },
      ...mutations,
      ...queries
    ];
  }
}


export default (()=>{
  return ServiceGenerator
})()
