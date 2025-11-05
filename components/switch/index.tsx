import {useMemo, useState} from "react";
import './index.less'

interface SwitchProps {
  activeText?: string
  inactiveText?: string
  defaultValue?: boolean
  onChange?: (checked: boolean) => void
}

export function Switch(props: SwitchProps) {
  const [checked, setChecked] = useState(props.defaultValue)
  const [currentLabel, setCurrentLabel] = useState(props.defaultValue ? (props.activeText || '已启用') : (props.inactiveText || '已关闭'))

  const handleChange = () => {
    props.onChange?.(!checked)
    setChecked(!checked)
    setTimeout(() => {
      setCurrentLabel(!checked ? (props.activeText || '已启用') : (props.inactiveText || '已关闭'))
    }, 150)
  }

  const buttonClassName = useMemo(() => {
    let className = ['kt-switch-button']
    if (checked) {
      className.push("active")
    }
    return className.join(' ')
  }, [checked])

  const labelClassName = useMemo(() => {
    let className = ['kt-switch-tip']
    if (checked) {
      className.push("active")
    }
    return className.join(' ')
  }, [checked])


  return (
    <div className={'kt-input-cmp kt-switch'} onClick={handleChange}>
      <div className={'kt-switch-label'}>
        <div className={labelClassName}>{currentLabel}</div>
        <div className={buttonClassName}></div>
      </div>

      {/*<div className={activeTipClassName}>{props.activeText || '已启用'}</div>*/}
      {/*<div className={inactiveTipClassName}>{props.inactiveText || '已关闭'}</div>*/}
    </div>
  )
}