import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import "~styles/global.less"
import './styles/index.less'
import {Novel} from "./pages/novel";
import {hotkey} from "~utils/hotkey.ts";
import {cache, config} from "~utils/config.ts";
import {listen} from "@tauri-apps/api/event";

preload().then(async () => {
  await hotkey.init(config.get('shortcut'))
  await listen('tauri://destroyed', async () => {
    await hotkey.destroy()
    await config.destroy()
    await cache.destroy()
  })
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Novel/>
  );
})



