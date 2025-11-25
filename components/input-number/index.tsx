import './index.less'
import {ChangeEvent, useMemo, useState} from "react";


interface InputNumberProps {
  defaultValue?: number
  onChange?: (value: number) => void
  disabled?: boolean
}

export function InputNumber(props: InputNumberProps) {
  const [value, setValue] = useState(props.defaultValue)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(+e.target.value)
    e.target.value = String(+e.target.value)
    props.onChange?.(+e.target.value)
  }

  const computedStyle = useMemo(() => {
    let style = ["kt-input-number", "kt-input-cmp"]
    if (props.disabled) {
      style.push("disabled")
    }
    return style.join(" ")
  }, [props.disabled])

  return (
    <div className={computedStyle}>
      <input type={'number'} className={'kt-input-number-inner lobster'} value={value || 0} onChange={onChange}/>
    </div>
  )
}