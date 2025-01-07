import './index.less'
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {webviewWindow} from "@tauri-apps/api";
import {useEffect, useState} from "react";

export default function Layout() {
  const navigate = useNavigate()
  const [showBack, setShowBack] = useState(false)
  const location = useLocation()

  useEffect(() => {
    navigate("/setting")
  }, [])

  useEffect(() => {
    setShowBack(location.pathname !== "")
  }, [location]);

  const minimize = async () => {
    await webviewWindow.getCurrentWebviewWindow().minimize()
  }

  const close = async () => {
    await webviewWindow.getCurrentWebviewWindow().close()
  }

  return (
    <div className="container">
      <div className="header" data-tauri-drag-region={true}>
        {showBack && (
          <span className={'min icon'} onClick={() => history.back()}>返回</span>
        )}
        <span className={'min icon'} onClick={() => navigate('/setting')}>设置</span>
        <span className={'min icon'} onClick={() => navigate('/preview')}>字体预览</span>
        <span className={'min icon'} onClick={minimize}>最小化</span>
        <span className={'close icon'} onClick={close}>关闭</span>
      </div>
      <div className="body">
        <Outlet/>
      </div>
      <div className="footer"></div>
    </div>
  )
}