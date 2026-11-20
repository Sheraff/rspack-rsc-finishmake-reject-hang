# Rspack RSC: a server `finishMake` tap that rejects before stage 0 makes the build hang

Reproduction for https://github.com/web-infra-dev/rspack/issues/16784.

Plain Rsbuild + `rsbuild-plugin-rsc`, no framework. `rsbuild.config.mjs` adds a plugin to the server
environment whose `finishMake` tap rejects at `REJECT_STAGE`.

```sh
npm install
npm run repro
```

```
no-reject  exit 0 after 0.2s
stage 5    exit 1 after 0.2s
stage -10  HANG   still running after 30.0s, killed
```

- `no-reject`: the tap resolves (control).
- `stage 5`: the tap rejects after Rspack's RSC plugin (`finishMake`, stage 0) handed off to the client compiler;
  the build fails and prints the error.
- `stage -10`: the tap rejects before that handoff; nothing is printed after `build started...` and the process
  uses a full CPU core until it is killed.

Expected: `stage -10` fails like `stage 5` (exit 1, error printed), as it does without `pluginRSC()`.

One build by hand: `REJECT_STAGE=-10 npx rsbuild build`.
