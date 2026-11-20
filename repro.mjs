// Runs `rsbuild build` three times and reports how each build ends:
//   no-reject  the server's finishMake tap resolves (control)
//   stage 5    the tap rejects after Rspack's RSC plugin has handed off to the client
//   stage -10  the tap rejects before that handoff
// A build still running after TIMEOUT_MS is killed and reported as HANG.
import { spawn } from 'node:child_process'

const TIMEOUT_MS = 30_000

await report('no-reject', undefined)
await report('stage 5', '5')
await report('stage -10', '-10')

async function report(label, rejectStage) {
  const result = await build(rejectStage)
  console.log(`${label.padEnd(10)} ${result}`)
}

function build(rejectStage) {
  const env = { ...process.env }
  if (rejectStage !== undefined) {
    env.REJECT_STAGE = rejectStage
  }
  const started = Date.now()
  const child = spawn('node_modules/.bin/rsbuild', ['build'], { env, stdio: 'ignore' })
  const timer = setTimeout(() => child.kill('SIGKILL'), TIMEOUT_MS)

  return new Promise((resolve) => {
    child.on('exit', (code, signal) => {
      clearTimeout(timer)
      const seconds = ((Date.now() - started) / 1000).toFixed(1)
      if (signal === 'SIGKILL') {
        resolve(`HANG   still running after ${seconds}s, killed`)
      } else {
        resolve(`exit ${code} after ${seconds}s`)
      }
    })
  })
}
