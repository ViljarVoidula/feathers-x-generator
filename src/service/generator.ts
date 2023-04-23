import * as fs from 'fs';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

class ServiceGenerator {
  name: string;
  description: string;
  constructor() {
    this.name = 'service';
    this.description = 'Service generator';
  }

  get prompts() {
    return [
      {
        type: 'input',
        name: 'item',
        message: 'How you call a single item handled by the service?',
      },
      {
        type: 'input',
        name: 'path',
        message: 'What path should the service be registered on?',
        default: (answers: any) => {
          return answers.item + 's';
        },
      },
      {
        name: 'authentication',
        type: 'confirm',
        message: 'Does the service require authentication? (yes/no)',
      },
      {
        name: 'commonProperties',
        type: 'list',
        message:
          'Do you want to use common properties(id, createdAt, updatedAt, etc)? (yes/no)',
        choices: ['Yes', 'No'],
      },
      {
        name: 'database',
        type: 'list',
        message: 'What database adapter is the service using?',
        choices: ['MongoDB', 'Knex'],
        default: () => {
          return packageJson.dependencies['@feathersjs/mongodb']
            ? 'MongoDB'
            : 'Knex';
        },
      },
      {
        name: 'graphql',
        type: 'confirm',
        message:
          'Do you want to generate GraphQL schema for the service? (yes/no)',
      },
    ];
  }

  actions(data: any) {
    const actions = [
      {
        type: 'add',
        path: '{{servicesPath}}/{{item}}s/{{item}}.schema.ts',
        templateFile: 'templates/schema.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesPath}}/src/services/{{item}}s/{{item}}.class.ts',
        templateFile: 'templates/class.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesPath}}/src/services/{{item}}s/{{item}}.ts',
        templateFile: 'templates/service.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesPath}}/test/services/{{item}}s/{{item}}.test.ts',
        templateFile: 'templates/test.ts.hbs',
      },
    ];

    /**
     * Setting common properties
     */

    if (data.commonProperties === 'Yes') {
      actions.push({
        type: 'add',
        path: '{{servicesPath}}/utils/schema-utils.ts',
        //@ts-ignore
        skipIfExists: true,
        templateFile: 'templates/schema-utils.ts.hbs',
      });

      actions.push({
        type: 'append',
        path: '{{servicesPath}}/{{item}}s/{{item}}.schema.ts',
        //@ts-ignore
        pattern: /\/\/!code:\s*default_imports\s+end/,
        template: `import { commonDataKeys, commonSchemaProperties } from '../../utils/schema-utils';\n`,
      });
      // if so, add the import to the file
      actions.push({
        type: 'modify',
        path: '{{servicesPath}}/{{item}}s/{{item}}.schema.ts',
        //@ts-ignore
        pattern:
          /\/\/!code:\s*schema_properties\s+([\s\S]*?)\/\/!code:\s*schema_properties end/g,
        template: `...commonSchemaProperties`,
      });

      actions.push({
        type: 'append',
        path: '{{servicesPath}}/{{item}}s/{{item}}.schema.ts',
        //@ts-ignore
        pattern: /\/\/!code:\s+picking_keys/,
        template: `            [...commonDataKeys(this.schema)],`,
      });
    } else {
      actions.push({
        type: 'append',
        path: '{{servicesPath}}/{{item}}s/{{item}}.schema.ts',
        //@ts-ignore
        pattern: /\/\/!code:\s+picking_keys/,
        template: `            [],`,
      });
    }

    /*
     * Setting database
     */
    if (data.database === 'MongoDB') {
      actions.push({
        type: 'modify',
        path: '{{servicesPath}}/{{item}}s/{{item}}.class.ts',
        //@ts-ignore
        pattern:
          /\/\/!code:define_model start\n([\s\S]*?)\/\/!code:define_model end/,
        template: `Model: app.get('mongodbClient').then((db) => db.collection('{{item}}s'))`,
      });
    }
    if (data.graphql) {
      actions.push({
        type: 'add',
        path: '{{servicesPath}}/{{item}}s/{{item}}.graphql.ts',
        templateFile: 'templates/graphql.ts.hbs',
      });
    }

    if (data.database === 'Knex') {
      actions.push({
        type: 'modify',
        path: '{{servicesPath}}/{{item}}s/{{item}}.class.ts',
        //@ts-ignore
        pattern:
          /\/\/!code:define_model start\n([\s\S]*?)\/\/!code:define_model end/,
        template: `Model: app.get('postgresClient'),`,
      });
    }

    actions.push({
      type: 'append',
      path: '{{servicesPath}}/index.ts',
      //@ts-ignore
      pattern: /import.*service.*;/g,
      template: `import { {{item}}s } from './{{item}}s/{{item}}';\n`,
    });
    actions.push({
      type: 'append',
      path: '{{servicesPath}}/index.ts',
      //@ts-ignore
      pattern: /\/\/!code:\s+generated_services start/g,
      template: `  app.configure({{item}}s);`,
    });

    return actions;
  }
}

export default new ServiceGenerator();
