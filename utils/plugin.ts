import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { config } from "~utils/config.ts";


class PluginLoader {
  private readonly plugins: Map<string, PluginInfo> = new Map();
  private readonly renders: Function[] = [];
  private readonly destroys: Function[] = [];
  private readonly settings: Map<string, AddSettingProps> = new Map();

  private createPluginEnv() {
    let _self = this
    return {
      PluginName: "",
      onInstalled: () => {

      },
      onUninstalled: () => {

      },
      onRender: (fn: Function) => {
        if (!this.renders.includes(fn))
          this.renders.push(fn)
      },
      onDestroy: (fn: Function) => {
        if (!this.destroys.includes(fn))
          this.destroys.push(fn)
      },
      addSetting(config: Array<AddSettingProps>) {
        let PluginName = this.PluginName
        config.forEach((item) => {
          _self.settings.set(PluginName + "_" + item.prop, { ...item, name: PluginName + " - " + item.name })
        })
      },
      subscribeConfigChange(prop: string, fn: (arg: any) => void) {
        config.on(prop, fn)
        return () => {
          config.off(prop, fn)
        }
      },
      getConfigValue(prop: string) {
        return config.get(prop)
      },
      readFile(path: string) {
        if (!this.PluginName) {
          return Promise.reject("非法调用")
        }
        return invoke<string>("read_file", { plugin: this.PluginName, path })
      }
    }
  }

  private execPlugin(plugin: PluginInfo, content: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const wrappedScript = `
            (async function(global) {
            "use strict";
            ${content}
            })(this);
            `;
        const env = this.createPluginEnv()
        const func = new Function("KtoolsPluginLoader", "PluginName", wrappedScript);
        await func({ ...env, PluginName: plugin.name });
        console.log(`插件 ${plugin.name} 加载成功\n`);
        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }

  private loadPlugin(plugin: PluginInfo) {
    return new Promise<void>((resolve, reject) => {
      invoke<string>("get_plugin_file", { plugin }).then((content: string) => {
        return this.execPlugin(plugin, content)
      }).then(() => {
        this.plugins.set(plugin.name, plugin)
        resolve()
      }).catch(reject)
    })
  }

  async create() {
    let list = await invoke<PluginInfo[]>("get_plugin_list")
    for (const plugin of list) {
      await this.loadPlugin(plugin)
    }
  }

  render() {
    let currentWindow = getCurrentWindow()
    this.renders.forEach(fn => fn(currentWindow.label))
  }

  destroy() {
    let currentWindow = getCurrentWindow()
    this.destroys.forEach(fn => fn(currentWindow.label))
  }

  getPluginSettings() {
    return this.settings
  }
}

export const pluginLoader = new PluginLoader()