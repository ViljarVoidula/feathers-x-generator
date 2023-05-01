import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3070/graphql',
  documents: ['src/**/*.graphql'],
  overwrite: true,
  generates: {
    'src/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      hooks: {
        afterAllFileWrite: ['yarn eslint'],
      },
    },
    src: {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: 'types.js',
      },
      plugins: ['typescript-operations', 'typescript-urql'],
      config: {
        importPathSuffix: '.js',
      },
      hooks: {
        afterAllFileWrite: ['yarn eslint --fix'],
      },
    },
  },
  config: {
    enumsAsConst: true,
    useTypeImports: true,
  },
}
export default config
