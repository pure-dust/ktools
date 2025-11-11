import {cache, config} from "~utils/config.ts";
import {pluginLoader} from "~utils/plugin.ts";

export default async function () {
  document.addEventListener('contextmenu', e => {
    e.preventDefault()
    e.stopPropagation()
    return true
  })
  await config.init()
  await cache.init()
  pluginLoader.create()
}