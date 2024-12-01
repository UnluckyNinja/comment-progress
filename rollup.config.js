import path from 'node:path'
import { fileURLToPath } from 'node:url'

import commonJS from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'module',
  },
  plugins: [
    esbuild({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      sourceMap: false,
      minify: false,
      target: 'es2020',
    }),
    commonJS({
      sourceMap: false,
    }),
    nodeResolve(),
  ],
  onwarn: (msg, warn) => {
    if (msg.code !== 'CIRCULAR_DEPENDENCY') {
      warn(msg)
    }
  },
  treeshake: {
    moduleSideEffects: false,
  },
})
