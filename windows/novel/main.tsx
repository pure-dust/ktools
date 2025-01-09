import ReactDOM from "react-dom/client";
import preload from "~utils/preload.ts";
import "~styles/global.less"
import './styles/index.less'
import {Novel} from "./pages/novel";
import {hotkey} from "~utils/hotkey.ts";
import {config} from "~utils/config.ts";

preload().then(async () => {
  await hotkey.init(config.get('shortcut'))
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Novel/>
  );
})



