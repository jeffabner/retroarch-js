import { makeSilence } from "./audiofix.js"

export const buildCore = async ({
  coreFactory,
  canvas,
  wasmUrl,
  wasmBinary,
  onReady
}) => {
  const Module = {
    canvas,
    noInitialRun: true,
    arguments: ["/rom.bin", "--verbose"],
    onRuntimeInitialized: () => {},
    print: console.log,
    printErr: console.log,
    preRun: [makeSilence],
    postRun: [],
    ...(wasmUrl && { locateFile: () => wasmUrl }),
    ...(wasmBinary && { wasmBinary })
  }

  const core = await coreFactory(Module)

  onReady?.()

  return core
}
