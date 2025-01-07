import './index.less'
import {ChangeEvent, useState} from "react";


interface InputNumberProps {
  defaultValue?: number
  onChange?: (value: number) => void
}

export function InputNumber(props: InputNumberProps) {
  const [value, setValue] = useState(props.defaultValue)
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(+e.target.value)
    e.target.value = String(+e.target.value)
    props.onChange?.(+e.target.value)
  }

  return (
    <div className={'kt-input-number kt-input-cmp'}>
      <input type={'number'} className={'kt-input-number-inner lobster'} value={value || 0} onChange={onChange}/>
    </div>
  )
}