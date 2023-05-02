import path from 'path';
import pluralize from 'pluralize';
import { cwd } from 'process';



class AdminInterfaceGenerator {
  name: string;
  description: string;

  constructor() {
    this.name = 'admin';
    this.description = 'Admin resource generator';

  }

  get prompts() {
    return [
      {
        type: 'confirm',
        name: 'initial',
        message: 'Is this the initial setup?',
        default: false,
      },
      {
        type: 'input',
        name: 'adminOutputPath',
        message: 'Where should the admin interface be generated? (relative to cwd)',
        when: (answers: any) => {
          return answers.initial;
        }
      },
      {
        type: 'input',
        name: 'resource',
        message: 'What is the name of the resource? (singular tense)',
        when: (answers: any) => {
          return !answers.initial;
        }
      },
      {
        type: 'confirm',
        name: 'list',
        message: 'Should add List view?',
        when: (answers: any) => {
          return !answers.initial;
        }
      },
      {
        type: 'confirm',
        name: 'create',
        message: 'Should add Create view?',
        when: (answers: any) => {
          return !answers.initial;
        }
      },
      {
        type: 'confirm',
        name: 'edit',
        message: 'Should add Edit view?',
        when: (answers: any) => {
          return !answers.initial;
        }
      },
    ];
  }

  actions(data: any) {
    
    const actions: any[] = [];
    // if there is no admin interface, copy files from base-files
    if (data.initial) {
      console.log('initial setup', JSON.stringify({
        sourceDir: path.join(__dirname, 'base-files', 'admin'),
        targetDir:  path.normalize(path.join(cwd(), data.adminOutputPath))
      }))
      // @ts-ignore
      actions.push({
        type: 'copyDirectory',
        sourceDir: path.join(__dirname, 'base-files', 'admin'),
        targetDir: path.normalize(path.join(cwd(), data.adminOutputPath))
      })

      actions.push({
        type: 'add',
        skipIfExists: true,
        path: path.normalize(path.join(cwd(), data.adminOutputPath)),
        templateFile: 'admin-interface/templates/config.hbs',
      })
    }
    // add resource to app and graphql file
    if(data.resource){
      actions.push({
        type: 'add',
        skipIfExists: true,
        path:  '{{adminOutputPath}}/src/resources/{{pluralize resource}}/{{pluralize resource}}.graphql',
        templateFile: 'admin-interface/templates/resource.graphql.hbs',
      })
      actions.push({
        type: 'add',
        skipIfExists: true,
        path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/index.ts',
        templateFile: 'admin-interface/templates/resource.index.hbs',
      })


      actions.push({
        type: 'append',
        unique: true,
        path: '{{adminOutputPath}}/src/dataproviders/graphql/dataprovider.ts',
        pattern: `//!code resource_import_map`,
        template: `    {{pluralize resource}}: await import("../../resources/{{pluralize resource}}/{{pluralize resource}}.generated"),`,
      })

      if(data.list){
        actions.push({
          type: 'add',
          skipIfExists: true,
          path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/list.tsx',
          templateFile: 'admin-interface/templates/list.hbs',
        })

        actions.push({
          type: 'add',
          skipIfExists: true,
          path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/show.tsx',
          templateFile: 'admin-interface/templates/show.hbs',
        })
      }
      if(data.create){
        actions.push({
          type: 'add',
          skipIfExists: true,
          path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/create.tsx',
          templateFile: 'admin-interface/templates/create.hbs',
        })
      }
      if(data.edit){
        actions.push({
          type: 'add',
          skipIfExists: true,
          path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/edit.tsx',
          templateFile: 'admin-interface/templates/edit.hbs',
        })
      }

      actions.push({
        type: 'append',
        path: '{{adminOutputPath}}/src/App.tsx',
        pattern: `//!code generated resources imports`,
        template: `import { ${data.list ? '{{properCase resource}}List,':''} ${data.create ? '{{properCase resource}}Create,':''} ${data.edit ? '{{properCase resource}}Edit,':''} ${data.list ? '{{properCase resource}}Show':''} } from "pages/{{pluralize resource}}";`
      })
      actions.push({
        type: 'modify',
        
        path: '{{adminOutputPath}}/src/pages/{{pluralize resource}}/index.ts',
        pattern: `//!code exports`,
        template: `export { ${data.list ? '{{properCase resource}}List } from "./list"\n': ''}export ${data.create ? '{ {{properCase resource}}Create } from "./create"\n': ''}export ${data.edit ? '{ {{properCase resource}}Edit } from "./edit"\n': ''}export ${data.list ? '{ {{properCase resource}}Show } from "./show"\n': ''}`
      })

      actions.push({
        type: 'append',
        path: '{{adminOutputPath}}/src/App.tsx',
        pattern: `//!code add resource`,
        template: `              {
                name: "{{pluralize resource}}",
                ${data.list ? 'list: "/{{pluralize resource}}",\n                show: "/{{pluralize resource}}/show/:id",': ''}
                ${data.create ? 'create: "/{{pluralize resource}}/create",': ''}
                ${data.edit ? 'edit: "/{{pluralize resource}}/edit/:id",': ''}
                meta:{
                  dataProviderName: "graphql",
                  canDelete: true,
                }
              },`
      })

      actions.push({
        type: 'append',
        path: '{{adminOutputPath}}/src/App.tsx',
        pattern: /\{\/\*!code for generated resources start\*\/\}/,
        template: `                  <Route path="/{{pluralize resource}}">
                  <Route index element={<{{properCase resource}}List />} />
                  <Route path="/{{pluralize resource}}/create" element={<{{properCase resource}}Create/>} />
                  <Route path="/{{pluralize resource}}/edit/:id" element={<{{properCase resource}}Edit/>} />
                  <Route path="/{{pluralize resource}}/show/:id" element={<{{properCase resource}}Show/>} />
                </Route>`
      })
    }


    return actions;
  }
}

export default (() => {
  return AdminInterfaceGenerator;
})();
