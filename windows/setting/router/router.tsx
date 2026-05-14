import {HashRouter, Route, Routes} from "react-router-dom";
import Layout from "~setting/layout";
import Setting from "~setting/pages/setting";
import Preview from "~setting/pages/preview";
import Net from "~setting/pages/net";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path={'/'} element={<Layout/>}>
          <Route path={'setting'} element={<Setting/>}/>
          <Route path={'preview'} element={<Preview/>}/>
          <Route path={'net'} element={<Net/>}/>
        </Route>
      </Routes>
    </HashRouter>
  )
}