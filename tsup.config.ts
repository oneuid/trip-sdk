import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
  },
  {
    entry: {
      widget: 'src/widget/index.ts',
    },
    format: ['iife'],
    globalName: 'TripExpressWidget',
    minify: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    treeshake: true,
    outExtension() {
      return {
        js: '.js',
      };
    },
  }
]);
