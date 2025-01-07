import {useState} from "react";
import DropDown from 'rc-dropdown'
import 'rc-dropdown/assets/index.css'
import './index.less'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  options: SelectOption[]
  defaultValue?: string
  onChange?: (value: string) => void
}

export function Select(props: SelectProps) {
  const [value, setValue] = useState(props.defaultValue)

  const onChange = (value: string) => {
    setValue(value)
    props.onChange?.(value)
  }

  return (
    <>
      <DropDown overlayClassName={'kt-select-dropdown'} trigger={'click'} animation="slide-up" overlay={() => (
        <>
          {props.options.map((option) => (
            <div className={option.value === value ? 'kt-select-dropdown-item selected' : 'kt-select-dropdown-item'}
                 key={option.value} onClick={() => onChange(option.value)}>{option.label}</div>
          ))}
        </>
      )}>
        <div className={'kt-select kt-input-cmp'}>
          <input className={'kt-select-inner'} value={value || ""} onChange={() => {
          }}/>
        </div>
      </DropDown>
    </>
  )
}