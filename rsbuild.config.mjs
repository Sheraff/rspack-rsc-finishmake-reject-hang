import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { Layers, pluginRSC } from 'rsbuild-plugin-rsc'

// REJECT_STAGE=-10 (or 5): a server-compiler finishMake tap at that stage rejects.
// Unset: the tap resolves (control).
const rejectStage = process.env.REJECT_STAGE

class FinishMakeTap {
  apply(compiler) {
    const stage = Number(rejectStage ?? -10)
    compiler.hooks.finishMake.tapPromise({ name: 'FinishMakeTap', stage }, async () => {
      if (rejectStage !== undefined) {
        throw new Error(`finishMake tap at stage ${stage} failed`)
      }
    })
  }
}

export default defineConfig({
  plugins: [pluginReact(), pluginRSC()],
  environments: {
    server: {
      source: {
        entry: { index: { import: './src/entry.rsc.jsx', layer: Layers.rsc } },
      },
      output: { module: true, distPath: { root: 'dist/server' } },
      tools: { rspack: { plugins: [new FinishMakeTap()] } },
    },
    client: {
      source: { entry: { index: './src/entry.client.jsx' } },
      output: { distPath: { root: 'dist/client' } },
    },
  },
})
