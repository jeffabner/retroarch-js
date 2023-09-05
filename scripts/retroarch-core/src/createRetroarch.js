import { Retroarch } from "./Retroarch.js"
import { buildCore } from "./buildCore.js"



const replacePostfix = (str, target, replacement) => {
  const lastIndex = str.lastIndexOf(target)
  const withoutLastEntry = str.slice(0, lastIndex)

  return `${withoutLastEntry}${replacement}`
}

const fetchWasm = async wasmUrl => {
  const buffer = await (await fetch(wasmUrl)).arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * fetch core's js and wasm files
 * @param coreUrl url of core js file
 */
export const fetchCore = async (coreUrl, wasmUrl, optionsUrl) => {
  const coreFactory = (
    await import(/* webpackIgnore: true */ /* @vite-ignore*/ coreUrl)
  ).default

  const wasmBinary = await fetchWasm(
    wasmUrl || replacePostfix(coreUrl, ".js", ".wasm")
  )

  const coreOptions = await import(
    /* webpackIgnore: true */ /* @vite-ignore*/
    optionsUrl || replacePostfix(coreUrl, ".js", ".options.js")
  )

  return { coreFactory, wasmBinary, coreOptions }
}

export const createRetroarch = async options => {
  if (options.beforeLoad) options.beforeLoad()

  const { coreFactory, wasmBinary, coreOptions } = await fetchCore(
    options.coreUrl,
    options.wasmUrl,
    options.optionsUrl
  )

  const core = await buildCore({
    canvas: options.canvas,
    coreFactory,
    wasmBinary,
    onReady: options.onReady
  })

  const retroarch = new Retroarch(core, {
    romBinary: options.romBinary,
    coreOptions: coreOptions.defaultOptions,
    onStart: options.onStart,
    onDestroy: options.onDestroy
  })
  retroarch.copyConfig(options.config)
  retroarch.copyOptions(coreOptions.defaultOptions, coreOptions.folder)

  return retroarch
}
