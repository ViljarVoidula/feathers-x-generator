import * as fs from 'fs';
import * as path from 'path';

import { NodePlopAPI } from 'plop';
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

const adminInterfaceGenerator = new AdminInterfaceGenerator();

module.exports = function Plopfile(plop: NodePlopAPI) {
  /*
    Initialize helpers rewrite all configuration key maps to factory function
  */
  plop.setHelper('adminOutputPath', () => {
    let adminOutputPath = path.normalize(
      process.cwd() + '/' + path.normalize(config?.admin_output_path ?? '')
    );
    return adminOutputPath;
  });

  plop.setHelper('id', () => {
    return config.db === 'mongodb' ? '_id' : 'id';
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
      //@ts-expect-error
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


  plop.setGenerator(adminInterfaceGenerator.name, {
    description: adminInterfaceGenerator.description,
    prompts: adminInterfaceGenerator.prompts,
    actions: adminInterfaceGenerator.actions,
  });
};
