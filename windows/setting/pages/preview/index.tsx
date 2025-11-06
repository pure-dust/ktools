import './index.less'
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export const AppFonts = [
  'bender',
  'geometos',
  'gilroy',
  'source',
  'acens',
  'amita',
  'square',
  'lobster',
  'monda',
  'mono',
  'montserrat',
  'soul',
  'zcoo',
]

export default function Preview() {
  const [fonts, setFonts] = useState<string[]>([])

  useEffect(() => {
    invoke<string[]>("get_system_fonts").then(res => {
      setFonts(res.concat(AppFonts))
    })
  }, []);

  return (
    <div className={'preview-page'}>
      {
        fonts.map(ft => (
          <div className={ft} style={{display: "flex", fontFamily: ft}} key={ft} onClick={() => {
            navigator.clipboard.writeText(ft)
          }}>
            <div style={{width: 180}}>{ft}</div>
            <div>
              012356789
              <br/>
              abcdefghijklmnopqrstuvwxyz
              <br/>
              你好世界
            </div>
          </div>
        ))
      }
    </div>
  )
}