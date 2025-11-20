import React from "react";
import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import Router from "./router/router.tsx";
import './styles/index.less'
import '~styles/global.less'

preload().then(async () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Router/>
    </React.StrictMode>
  )
})

