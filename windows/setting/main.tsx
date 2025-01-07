import React from "react";
import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import '~styles/global.less'
import './styles/index.less'
import Router from "./router/router.tsx";
import {listen} from "@tauri-apps/api/event";
import {cache, config} from "~utils/config.ts";

preload().then(async () => {
  await listen('tauri://destroyed', async () => {
    await config.destroy()
    await cache.destroy()
  })

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Router/>
    </React.StrictMode>
  )
})

