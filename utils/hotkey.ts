import {isRegistered, register, ShortcutEvent, unregister, unregisterAll} from "@tauri-apps/plugin-global-shortcut";
import {config} from "~utils/config.ts";
import {Emitter} from "~utils/emiter.ts";

export function parseKey(code: string) {
    let rust_key: string
    let platform_key: string
    if (/shift/ig.test(code)) {
        platform_key = "Shift"
        rust_key = platform_key
    } else if (/control/ig.test(code)) {
        platform_key = "Ctrl"
        rust_key = "CommandOrControl"
    } else if (/command/ig.test(code)) {
        platform_key = "Command"
        rust_key = "CommandOrControl"
    } else if (/alt/ig.test(code)) {
        platform_key = "Alt"
        rust_key = platform_key
    } else if (/option/ig.test(code)) {
        platform_key = "Option"
        rust_key = "Alt"
    } else if (/(key|digit)/ig.test(code)) {
        platform_key = code.replace(/(key|digit)/ig, "")
        rust_key = code
    } else if (/Num/ig.test(code)) {
        platform_key = code.replace(/Divide/ig, "/")
            .replace(/Multiply/ig, "*ig")
            .replace(/Subtract/ig, "-")
            .replace(/Add/ig, "+")
            .replace(/Decimal/ig, ".")
        rust_key = code
    } else {
        rust_key = code
        platform_key = code
    }
    return {platform_key, rust_key}
}

export function decodeKey(code: string) {
    if (code === "CommandOrControl") {
        return "Ctrl"
    } else if (/(key|digit)/ig.test(code)) {
        return code.replace(/(key|digit)/ig, "")
    } else if (/Num/ig.test(code)) {
        return code.replace(/Divide/ig, "/")
            .replace(/Multiply/ig, "*ig")
            .replace(/Subtract/ig, "-")
            .replace(/Add/ig, "+")
            .replace(/Decimal/ig, ".")
    } else {
        return code
    }
}

class HotkeyManager extends Emitter {
    private static instance: HotkeyManager
    private readonly hotkeys: Map<string, string> = new Map()
    private readonly events: Map<string, ShortcutEvent> = new Map()
    private isInit = false
    private tick?: number

    constructor() {
        super()
        if (!HotkeyManager.instance) {
            HotkeyManager.instance = this
        }
        return HotkeyManager.instance
    }

    async init(hotkeys: Record<string, string>) {
        if (this.isInit) return
        await unregisterAll()
        for (const [key, value] of Object.entries(hotkeys)) {
            config.on(`shortcut.${key}`, ([_, key, newVal]) => {
                this.update(key, newVal)
            })
            if (await this.register(key, value)) {
                this.hotkeys.set(key, value)
            }
        }
        this.isInit = true
        this.eventTick()
    }

    async destroy() {
        if (this.tick) {
            cancelAnimationFrame(this.tick)
        }
        await unregisterAll()
    }

    private eventTick() {
        const tickFn = () => {
            this.events.forEach((_, key) => {
                this.emit(key, 'Pressing')
            })
            this.tick = requestAnimationFrame(tickFn)
        }
        tickFn()
    }

    private async register(key: string, value: string) {
        try {
            if (await isRegistered(value)) {
                await unregister(value)
            }
            await register(value, (event) => {
                if (event.state === "Pressed") {
                    this.events.set(key, event)
                    this.emit(key, "Pressed")
                } else if (event.state === "Released") {
                    this.emit(key, "Released")
                    this.events.delete(key)
                }
            })
            return true
        } catch (err) {
            console.warn(err)
            return false
        }
    }

    private async update(key: string, value: string) {
        if (!this.hotkeys.has(key)) {
            return false
        }
        if (await this.register(key, value)) {
            return this.hotkeys.set(key, value)
        }
        return false
    }
}

export const hotkey = new HotkeyManager()