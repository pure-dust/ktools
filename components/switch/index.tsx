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

  const handleChange = () => {
    setChecked(!checked)
    props.onChange?.(!checked)
  }

  const className = useMemo(() => {
    if (checked) {
      return 'kt-switch-button active'
    } else {
      return 'kt-switch-button'
    }
  }, [checked])

  return (
    <div className={'kt-input-cmp kt-switch'} onClick={handleChange}>
      <div className="kt-switch-label">
        <div className={'kt-switch-tip'}>{props.activeText || '已启用'}</div>
        <div className={'kt-switch-tip inactive'}>{props.inactiveText || '已关闭'}</div>
      </div>
      <div className={className}></div>
    </div>
  )
}