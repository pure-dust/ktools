import React from "react";
import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import '~styles/global.less'
import './styles/index.less'
import Router from "./router/router.tsx";

preload().then(async () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Router/>
    </React.StrictMode>
  )
})

