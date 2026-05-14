import './index.less'
import {ChangeEvent, useMemo, useState} from "react";

interface InputNumberProps {
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function InputString(props: InputNumberProps) {
  const [value, setValue] = useState(props.defaultValue)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    e.target.value = String(e.target.value)
    props.onChange?.(e.target.value)
  }

  const computedStyle = useMemo(() => {
    let style = ["kt-input-string", "kt-input-cmp"]
    if (props.disabled) {
      style.push("disabled")
    }
    return style.join(" ")
  }, [props.disabled])

  return (
    <div className={computedStyle}>
      <input type={'text'} className={'kt-input-string-inner'} value={value || ""} onChange={onChange}/>
    </div>
  )
}