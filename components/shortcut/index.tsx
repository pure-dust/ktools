import {FocusEvent, KeyboardEvent, useEffect, useRef, useState} from "react";
import './index.less'
import {decodeKey, encodeKey} from "~utils/hotkey.ts";

interface ShortcutProps {
  defaultValue?: string
  onChange?: (value: string) => void
}

export function Shortcut(props: ShortcutProps) {
  const [value, setValue] = useState(props.defaultValue || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const platformKeys = useRef<string[]>([])
  const rustKeys = useRef<string[]>([])
  const downKeys = useRef(new Set<string>())

  useEffect(() => {
    let keys = props.defaultValue?.split("+")
    if (!keys) {
      return
    }
    rustKeys.current = []
    platformKeys.current = []
    keys.forEach(key => {
      rustKeys.current.push(key)
      platformKeys.current.push(decodeKey(key))
    })
    setValue(platformKeys.current.join("  +  "))
  }, [props.defaultValue]);

  const onClick = () => {
    inputRef.current!.focus()
  }

  const onBlur = (_e: FocusEvent) => {
    setValue(platformKeys.current.join("  +  "))
    props.onChange?.(rustKeys.current.join("+"))
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const {code} = e
    const {platform_key, rust_key} = encodeKey(code)
    downKeys.current.add(code)
    if (code === "Escape") {
      // emit("default")
      return;
    } else if (code === "Backspace") {
      platformKeys.current = []
      rustKeys.current = []
      setValue('')
      return;
    } else if (code === "Enter") {
      inputRef.current?.blur()
      props.onChange?.(rustKeys.current.join("+"))
      setValue(platformKeys.current.join("  +  "))
      return
    } else if (downKeys.current.size === 0 && value.length > 0) {
      platformKeys.current = []
      rustKeys.current = []
      setValue('')
    }
    if (platformKeys.current.length >= 3 || platformKeys.current.includes(platform_key)) {
      return
    }
    platformKeys.current.push(platform_key)
    rustKeys.current.push(rust_key)
    setValue(platformKeys.current.join("  +  "))
    e.preventDefault()
  }

  return (
    <div className={'kt-shortcut kt-input-cmp'} onClick={onClick}>
      <input className={"kt-shortcut-inner"} ref={inputRef} onBlur={onBlur} value={value || ""}
             onKeyDown={onKeyDown}
             onChange={() => {
             }}/>
    </div>
  )
}