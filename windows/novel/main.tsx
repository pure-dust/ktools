import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import "~styles/global.less"
import './styles/index.less'
import {Novel} from "./pages/novel";
import {hotkey} from "~utils/hotkey.ts";
import {cache, config} from "~utils/config.ts";
import {listen} from "@tauri-apps/api/event";
import {filename} from "~utils/utils.ts";
import {novel} from "~utils/novel.ts";

preload().then(async () => {
  await hotkey.init(config.get('shortcut'))

  await listen('tauri://close-requested', async () => {

    if (novel.path) {
      await cache.update(`novel.list.${filename(novel.path)}`, {
        path: novel.path,
        chapter: novel.chapter,
        line: novel.line,
      })
    }
  })
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Novel/>
  );
})



