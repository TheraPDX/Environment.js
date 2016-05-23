import config from './rollup.config';

config.format = 'umd';
config.dest = 'dist/Environment.umd.js';
config.moduleName = 'Environment';

export default config;
