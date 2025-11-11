import {invoke} from "@tauri-apps/api/core";


class PluginLoader {
  private readonly plugins: Map<string, PluginInfo> = new Map();
  private readonly renders: Function[] = [];

  create() {
    invoke<PluginInfo[]>("get_plugin_list").then(async (list) => {
      for (const plugin of list) {
        await this.loadPlugin(plugin)
      }
    })
  }

  render() {
    this.renders.forEach(fn => fn())
  }

  destroy() {

  }

  private createPluginEnv() {
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
      onDestroy: () => {

      },
      readFile(path: string) {
        if (!this.PluginName) {
          return Promise.reject("非法调用")
        }
        return invoke<string>("read_file", {plugin: this.PluginName, path})
      }
    }
  }

  private execPlugin(plugin: PluginInfo, content: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        const wrappedScript = `
                (function(global) {
                    "use strict";
                    ${content}
                })(this);
            `;
        const env = this.createPluginEnv()
        const func = new Function("KtoolsPluginLoader", "PluginName", wrappedScript);
        func({...env, PluginName: plugin.name});
        resolve();
      } catch (e) {
        reject(e)
      }
    })
  }

  private loadPlugin(plugin: PluginInfo) {
    return new Promise<void>((resolve, reject) => {
      invoke<string>("get_plugin_file", {plugin}).then((content: string) => {
        return this.execPlugin(plugin, content)
      }).then(() => {
        this.plugins.set(plugin.name, plugin)
        resolve()
      }).catch(reject)
    })
  }

}

export const pluginLoader = new PluginLoader()