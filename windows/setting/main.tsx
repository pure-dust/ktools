import React from "react";
import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import Router from "./router/router.tsx";
import './styles/index.less'
import '~styles/global.less'
import {pluginLoader} from "~utils/plugin.ts";

preload().then(async () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Router/>
    </React.StrictMode>
  )
  pluginLoader.render()
})

