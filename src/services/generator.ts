import * as fs from 'fs';
import pluralize from 'pluralize';
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
          return pluralize(answers.item);
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
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.schema.ts',
        skipIfExists: true,
        templateFile: 'services/templates/schema.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.class.ts',
        skipIfExists: true,
        templateFile: 'services/templates/class.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.ts',
        skipIfExists: true,
        templateFile: 'services/templates/service.ts.hbs',
      },
      {
        type: 'add',
        path: '{{testsOuputPath}}/services/{{pluralize item}}/{{item}}.test.ts',
        skipIfExists: true,
        templateFile: 'services/templates/test.ts.hbs',
      },
      {
        type: 'add',
        path: '{{appRootPath}}/validators.ts',
        skipIfExists: true,
        templateFile: 'services/templates/validators.ts.hbs',
      },
      {
        type: 'add',
        path: '{{appRootPath}}/declarations.ts',
        skipIfExists: true,
        templateFile: 'services/templates/declarations.ts.hbs',
      },
      {
        type: 'add',
        path: '{{servicesOutputPath}}/index.ts',
        skipIfExists: true,
        templateFile: 'services/templates/index.ts.hbs',
      },
    ];

    /**
     * Setting common properties
     */

    if (data.commonProperties === 'Yes') {
      actions.push({
        type: 'add',
        path: '{{servicesOutputPath}}/../utils/schema-utils.ts',
        //@ts-ignore
        skipIfExists: true,
        templateFile: 'services/templates/schema-utils.ts.hbs',
      });

      actions.push({
        type: 'append',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.schema.ts',
        skipIfExists: true,
        //@ts-ignore
        pattern: /\/\/!code:\s*default_imports\s+end/,
        template: `import { commonDataKeys, commonSchemaProperties, commonSchemaPropertiesResolvers } from '../../utils/schema-utils';\n`,
      });
      // if so, add the import to the file
      actions.push({
        type: 'modify',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.schema.ts',
        skipIfExists: true,
        //@ts-ignore
        pattern:
          /\/\/!code:\s*schema_properties\s+([\s\S]*?)\/\/!code:\s*schema_properties end/g,
        template: `...commonSchemaProperties`,
      });

      actions.push({
        type: 'append',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.schema.ts',
        skipIfExists: true,
        //@ts-ignore
        pattern: /\/\/!code:\s+picking_keys/,
        template: `            [...commonDataKeys(this.schema)],`,
      });
    } else {
      actions.push({
        type: 'append',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.schema.ts',
        //@ts-ignore
        pattern: /\/\/!code:\s+picking_keys/,
        template: `            [],`,
      });
    }

    if (data.graphql) {
      actions.push({
        type: 'add',
        skipIfExists: true,
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.graphql.ts',
        templateFile: 'services/templates/graphql.ts.hbs',
      });
    }
    if (data.database === 'MongoDB') {
      actions.push({
        type: 'modify',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.class.ts',
        //@ts-ignore
        pattern:
          /\/\/!code define_model start\n([\s\S]*?)\/\/!code define_model end/,
        template: `Model: app.get('mongodbClient').then((db) => db.collection('{{pluralize item}}'))`,
      });
    }

    if (data.database === 'Knex') {
      actions.push({
        type: 'modify',
        path: '{{servicesOutputPath}}/{{pluralize item}}/{{item}}.class.ts',
        //@ts-ignore
        pattern:
          /\/\/!code define_model start\n([\s\S]*?)\/\/!code define_model end/,
        template: `Model: app.get('postgresqlClient'),\n    name: '${pluralize(
          data.item
        )}'`,
      });
    }

    actions.push({
      type: 'append',
      path: '{{servicesOutputPath}}/../utils/schema-utils.ts',
      //@ts-ignore
      pattern: /\/\/!code:\s*id_field/g,
      template: `  ${
        data.database === 'MongoDB' ? '_id' : 'id'
      }: Type.String(),\n`,
    });

    actions.push({
      type: 'append',
      path: '{{servicesOutputPath}}/index.ts',
      //@ts-ignore
      pattern: /\/\/!code:\s*generated_services_imports/g,
      template: `import { {{pluralize item}} } from './{{pluralize item}}/{{item}}';\n`,
    });
    actions.push({
      type: 'append',
      path: '{{servicesOutputPath}}/index.ts',
      //@ts-ignore
      pattern: /\/\/!code:\s+generated_services start/g,
      template: `  app.configure({{pluralize item}});`,
    });

    return actions;
  }
}

export default new ServiceGenerator();
