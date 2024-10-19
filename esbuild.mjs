import * as esbuild from 'esbuild';

for (const isProd of [false, true]) {
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: isProd,
    sourcemap: !isProd ? 'inline' : undefined,
    format: 'iife',
    target: 'es2017',
    globalName: 'Shogiground',
    outfile: 'dist/shogiground' + (isProd ? '.min.js' : '.js'),
    footer: {
      js: 'Shogiground = Shogiground.default;',
    },
  });
}
