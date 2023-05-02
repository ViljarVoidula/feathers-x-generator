import * as fs from 'fs';
import * as path from 'path';

import { NodePlopAPI } from 'plop';
import ServiceGenerator from './services/generator';
import GraphqQLGenerator from './graphql/generator';
import AdminInterfaceGenerator from './admin-interface/generator';
import pluralize from 'pluralize';

const searchForConfig = (dir: string): any | undefined => {
  const configPath = path.join(dir, '.feathers-x.config.json');
  if (fs.existsSync(configPath)) {
    const config = require(configPath);
    return config;
  } else {
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      // Reached the root directory, config file not found
      return undefined;
    } else {
      return searchForConfig(parentDir);
    }
  }
};

const config = searchForConfig(process.cwd());
const graphqQLGenerator = new GraphqQLGenerator(config);


module.exports = function Plopfile(plop: NodePlopAPI) {
  /*
    Initialize helpers rewrite all configuration key maps to factory function
  */
  plop.setHelper('graphQLOutputPath', () => {
    let graphQLOutputPath = path.normalize(
      process.cwd() + '/' + config.graphql_output_path.replace('.', '')
    );
    return graphQLOutputPath;
  });
  plop.setHelper('servicesOutputPath', () => {
    let servicesOutputPath = path.normalize(
      process.cwd() + '/' + config.services_output_path.replace('.', '')
    );
    return servicesOutputPath;
  });
  plop.setHelper('testsOuputPath', () => {
    let testsOuputPath = path.normalize(
      process.cwd() + '/' + config.tests_output_path.replace('.', '')
    );
    return testsOuputPath;
  });
  plop.setHelper('appRootPath', () => {
    let appRootPath = path.normalize(
      process.cwd() + '/' + config.app_root_path.replace('.', '')
    );
    return appRootPath;
  });

  plop.setHelper('pluralize', (str: string) => {
    return pluralize(str);
  });

  /*
    Initialize custom actions
  */

  plop.setActionType('copyDirectory', (answers, config) => {
    const sourceDir = config.sourceDir;
    const targetDir = config.targetDir;

    const copyRecursiveSync = (src, dest) => {
      // if directory does exist do nothing
      if(fs.existsSync(dest)) {
        return
      }
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      //@ts-ignore
      const isDirectory = exists && stats.isDirectory();

      if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    copyRecursiveSync(sourceDir, targetDir);
    return 'Project setup complete';
  });

  plop.setGenerator(ServiceGenerator.name, {
    description: ServiceGenerator.description,
    prompts: ServiceGenerator.prompts,
    actions: ServiceGenerator.actions,
  });

  plop.setGenerator(graphqQLGenerator.name, {
    description: graphqQLGenerator.description,
    prompts: graphqQLGenerator.prompts,
    actions: graphqQLGenerator.actions,
  });

};
