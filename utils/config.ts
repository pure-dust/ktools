import {BaseDirectory} from "@tauri-apps/api/path";
import default_config from '~assets/default.ts'
import {FileHandle, open, readTextFile} from "@tauri-apps/plugin-fs";
import {deep_proxy, equals} from "~utils/utils.ts";
import {EventEmitter} from "@tauri-apps/plugin-shell";
import {emit, listen} from "@tauri-apps/api/event";
import {getCurrentWindow} from "@tauri-apps/api/window";

interface UpdateParams {
    target: object
    key: string
    newValue: any
    oldValue: any
    label: string
    manage: string
}

export class ConfigManager<T> extends EventEmitter<any> {
    private static readonly instance: Map<string, ConfigManager<any>> = new Map()
    private readonly default_config = {}
    private readonly file_name: string = ''
    private base = BaseDirectory.AppConfig
    private config: T | undefined
    private isInit = false
    private file: FileHandle | undefined
    private readonly encoder = new TextEncoder()
    private isSync: boolean = false

    constructor(file_name: string, defaultConfig: object) {
        super()
        if (!ConfigManager.instance.has(file_name)) {
            this.file_name = file_name
            this.default_config = defaultConfig
            ConfigManager.instance.set(file_name, this)
        }
        return ConfigManager.instance.get(file_name)!
    }

    private async write(is_default = false) {
        await this.file?.truncate()
        await this.file?.seek(0, 0)
        await this.file?.write(this.encoder.encode(JSON.stringify(is_default ? this.default_config : this.config, undefined, 2)))
    }

    private async register_event() {
        await listen<UpdateParams>("config-update", async ({payload}) => {
            if (payload.label === getCurrentWindow().label) {
                return
            }
            if (payload.manage !== this.file_name) {
                return
            }
            if (equals(this.get(payload.key), payload.newValue)) {
                return
            }
            console.log('listen')
            this.isSync = true
            await this.update(payload.key, payload.newValue)
        })
    }

    private async load_file() {
        this.file = await open(this.file_name, {baseDir: this.base, read: true, write: true, create: true})
        let info = await this.file?.stat()
        if (info.size === 0) {
            await this.write(true)
        }
        // @ts-ignore
        let content: Uint8Array = await readTextFile(this.file_name, {baseDir: this.base})
        // let origin = JSON.parse(await readTextFile(this.file_name, {baseDir: this.base}))
        let origin = JSON.parse(new TextDecoder().decode(content))
        this.config = deep_proxy(origin, async (target, key, newValue, oldValue) => {
            if (!this.isSync) {
                await emit("config-update", {
                    target,
                    key,
                    newValue,
                    oldValue,
                    label: getCurrentWindow().label,
                    manage: this.file_name
                })
                await this.write()
            }
            this.isSync = false
            this.emit(key, [target, key, newValue, oldValue])
        })
    }

    async init() {
        if (this.isInit) return
        await this.load_file()
        await this.register_event()
        this.isInit = true
    }

    async update(key: string, value: any) {
        let keys = key.split(".")
        let p: any = this.config
        let i = 0
        while (i < keys.length - 1) {
            p = p?.[keys[i]]
            i++
        }
        p[keys.at(-1)!] = value
    }

    async destroy() {
        await this.file?.close()
    }

    get<T>(key?: string) {
        if (!key) {
            return this.config as T
        }
        let keys = key.split(".")
        let result: any = this.config
        keys.forEach(k => {
            result = result?.[k]
        })
        return result as T
    }
}

export const config = new ConfigManager<Config>("config.json", default_config)

export const cache = new ConfigManager<AppCache>("cache.json", {
    novel: {
        last: "",
        regexp: config.get('novel.regexp'),
        list: {}
    }
})
