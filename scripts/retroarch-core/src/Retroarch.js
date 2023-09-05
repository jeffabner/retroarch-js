import { stringifySettings,defaultConfig } from "./config.js"
//import {
 // type RetroarchConfig,
  //defaultConfig,
 // stringifySettings,
//} from "./config.js"

export class Retroarch {
  status = "idle"

  options = {}

  constructor(module, options = {}) {
    this.module = module
    this.options = options
    options.romBinary && this.copyRom(options.romBinary)
  }

  destroy() {
    try {
      this.module._emscripten_exit_pointerlock()
      this.module._emscripten_force_exit()
    } catch (e) {
      this.module.JSEvents.removeAllEventListeners()
      this.changeStatus("destroyed")
      this.options.onDestroy?.()
    }
  }

  copyFile(file, path, filename) {
    if (this.module.FS.analyzePath(path).exists === false) {
      this.module.FS.createPath("/", path, true, true)
    }

    this.module.FS.writeFile(`${path}/${filename}`, file)
  }

  copyConfig(config = {}) {
    this.copyFile(
      stringifySettings({ ...defaultConfig, ...config }),
      "home/web_user/retroarch/userdata",
      "retroarch.cfg"
    )
  }

  copyOptions(options = {}, folder) {
    this.copyFile(
      stringifySettings({ ...this.options.coreOptions, ...options }),
      `home/web_user/retroarch/userdata/config/${folder}`,
      "rom.opt"
    )
  }

  copyRom(file) {
    this.copyFile(file, "/", "rom.bin")
  }

  copySave(state) {
    this.copyFile(state, "home/web_user/retroarch/userdata/states", "rom.state")
  }

  start() {
    this.module.callMain(["/rom.bin", "--verbose"])
    this.module.resumeMainLoop()
    this.options.onStart?.()
    this.changeStatus("started")
  }

  pause() {
    this.module.pauseMainLoop()
  }

  resume() {
    this.module.resumeMainLoop()
  }

  setCanvasSize(width, height) {
    this.module.setCanvasSize(width, height)
  }

  dispatchEvent(status) {
    const event = new CustomEvent("retroarch-status", {
      detail: status,
      bubbles: true
    })
    this.module.canvas.dispatchEvent(event)
  }

  changeStatus(status) {
    this.status = status
    this.dispatchEvent(status)
  }
}

