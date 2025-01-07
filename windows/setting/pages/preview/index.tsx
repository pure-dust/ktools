import './index.less'

const fonts = [
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

  return (
    <div className={'preview-page'}>
      {
        fonts.map(ft => (
          <div className={ft} style={{display: "flex"}} key={ft} onClick={() => {
            navigator.clipboard.writeText(ft)
          }}>
            <div style={{width: 120}}>{ft}</div>
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