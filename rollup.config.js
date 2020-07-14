import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/shogiground.js',
      format: 'iife',
      name: 'Chessground',
    },
    {
      file: 'dist/shogiground.min.js',
      format: 'iife',
      name: 'Chessground',
      plugins: [
        terser({
          safari10: true,
        }),
      ],
    },
  ],
  plugins: [
    typescript(),
    commonjs({
      extensions: ['.js', '.ts'],
    }),
  ],
};
