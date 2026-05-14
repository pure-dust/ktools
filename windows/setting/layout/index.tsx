import './index.less'
import {Outlet, useNavigate} from "react-router-dom";
import {webviewWindow} from "@tauri-apps/api";
import {useEffect} from "react";

export default function Layout() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/setting")
  }, [])

  const minimize = async () => {
    await webviewWindow.getCurrentWebviewWindow().minimize()
  }
  const close = async () => {
    await webviewWindow.getCurrentWebviewWindow().close()
  }

  return (
    <div className="container">
      <div className="header" data-tauri-drag-region={true}>
        <span className={'min icon'} onClick={() => navigate('/net')}>阅读</span>
        <span className={'min icon'} onClick={() => navigate('/setting')}>设置</span>
        <span className={'min icon'} onClick={() => navigate('/preview')}>字体预览</span>
        <span className={'min icon'} onClick={minimize}>最小化</span>
        <span className={'close icon'} onClick={close}>关闭</span>
      </div>
      <div className="body scroller">
        <Outlet/>
      </div>
      <div className="footer"></div>
    </div>
  )
}