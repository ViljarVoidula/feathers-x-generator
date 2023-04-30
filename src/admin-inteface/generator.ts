import { cwd } from 'process';

class AdminInterfaceGenerator {
  name: string;
  description: string;
  isNew: boolean;
  constructor(isNew: boolean) {
    this.name = 'admin';
    this.isNew = isNew;
    this.description = 'Admin resource generator';
  }

  get prompts() {
    return [
      {
        type: 'input',
        name: 'resource',
        message: 'What is the name of the resource? (singular tense)',
      },
      {
        type: 'confirm',
        name: 'list',
        message: 'Should add List view?',
      },
      {
        type: 'confirm',
        name: 'create',
        message: 'Should add Create view?',
      },
      {
        type: 'confirm',
        name: 'edit',
        message: 'Should add Edit view?',
      },
    ];
  }

  actions(data: any) {
    const actions = [];
    // if there is no admin interface, copy files from base-files
    if (this.isNew) {
      // @ts-ignore
      actions.push({
        type: 'copyDirectory',
        sourceDir: './base-files',
        targetDir: cwd()
      })
    }
    // add resource to app and graphql file

    // create pages for the resource

    // add routes for the resource

    return actions;
  }
}

export default (() => {
  return AdminInterfaceGenerator;
})();
