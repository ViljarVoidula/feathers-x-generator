import * as fs from 'fs';
import * as path from 'path';

import { NodePlopAPI } from 'plop';
import ServiceGenerator from './service/generator';
import GraphqQLGenerator from './graphql/generator';

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
  plop.setHelper('outputPath', () => {
    let outputPath = path.normalize(
      process.cwd() + '/' + config.output_path.replace('.', '')
    );
    return outputPath;
  });
  plop.setHelper('servicesPath', () => {
    let servicesPath = path.normalize(
      process.cwd() + '/' + config.services_path.replace('.', '')
    );
    return servicesPath;
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
