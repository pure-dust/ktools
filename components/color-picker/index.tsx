import {useMemo, useState} from "react";
import {HexAlphaColorPicker, HexColorInput} from 'react-colorful'
import {Modal} from "~components/modal";
import "./index.less"
import {hex2hsl} from "~components/color-picker/utils.ts";


interface ColorPickerProps {
  defaultValue?: string
  onChange?: (color: string) => void
  disabled?: boolean
}

export function ColorPicker(props: ColorPickerProps) {
  const [color, setColor] = useState(props.defaultValue || "#ffffff")
  const [visible, setVisible] = useState(false)

  const onChange = (color: string) => {
    setColor(color)
    props.onChange?.(color)
  }

  const fontColor = useMemo(() => {
    let l: number | string
    l = hex2hsl(color)[2]
    if (typeof l === 'string') {
      return "#ffffff"
    }
    return l > 50 ? "#000000" : "#ffffff"
  }, [color])

  const computedStyle = useMemo(() => {
    let style = ["kt-color-picker", "kt-input-cmp", "lobster"]
    if (props.disabled) {
      style.push("disabled")
    }
    return style.join(" ")
  }, [props.disabled])

  return (<>
    <div className={computedStyle} style={{background: color, color: fontColor}}
         onClick={() => {
           if (props.disabled) return
           setVisible(true)
         }}>
      {color}
    </div>
    <Modal visible={visible} onClose={() => setVisible(false)}>
      <HexAlphaColorPicker color={color} onChange={onChange}/>
      <HexColorInput className={'kt-color-input lobster'} color={color} onChange={onChange} prefix={"#"} alpha={true}/>
    </Modal>
  </>)
}