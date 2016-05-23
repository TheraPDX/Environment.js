import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'lib/Environment.js',
  sourceMap: true,
  plugins: [babel(), nodeResolve({ jsnext: true, main: true })]
};
