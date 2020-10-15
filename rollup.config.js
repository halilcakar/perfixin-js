import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/perfixin.js',
      format: 'iife',
      name: 'perfixin',
      plugins: [terser()]
    }
  ]
};