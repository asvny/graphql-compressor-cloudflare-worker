const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = [
  {
    input: 'cloudflare-worker/worker.ts',
    output: {
      file: 'cloudflare-worker/dist/worker.js',
      format: 'iife'
    },
    plugins: [
      commonjs({
        namedExports: {
          'node_modules/graphql-deduplicator/dist/index.js': ['deflate']
        }
      }),
      resolve(),
      typescript({ target: 'es2019' })
    ]
  },
  {
    input: 'service-worker/sw.ts',
    output: {
      file: 'server/static/sw.js',
      format: 'iife'
    },
    plugins: [
      commonjs({
        namedExports: {
          'node_modules/graphql-deduplicator/dist/index.js': ['inflate']
        }
      }),
      resolve(),
      typescript({ target: 'es2019' })
    ]
  }
]