import {CSSProperties, PropsWithChildren, useMemo} from "react";
import './index.less'

interface ButtonProps extends PropsWithChildren {
  onClick?: () => void
  block?: boolean
  size?: "small" | "medium" | "large"
  type?: "primary" | "success" | "danger" | "warning"
  style?: CSSProperties
}

export function Button(props: ButtonProps = {size: 'medium'}) {

  const className = useMemo(() => {
    let classNames = ["kt-button"]
    if (!props.type) {
      classNames.push("primary")
    } else {
      classNames.push(props.type)
    }
    if (!props.size) {
      classNames.push("medium")
    } else {
      classNames.push(props.size)
    }
    if (props.block) {
      classNames.push("block")
    }
    return classNames.join(" ")
  }, [])

  return (
    <div className={className} style={props.style} onClick={props.onClick}>{props.children}</div>
  )
}