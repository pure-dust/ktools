import {useCallback, useEffect, useRef, useState} from "react";
import DropDown from 'rc-dropdown'
import 'rc-dropdown/assets/index.css'
import './index.less'

type RemoteRequest<T> = () => Promise<T>;

interface SelectProps {
  options: SelectOption[] | RemoteRequest<SelectOption[]>
  defaultValue?: string
  onChange?: (value: string) => void
}


export function Select(props: SelectProps) {
  const dropdownRef = useRef<any>();
  const [triggerRect, setTriggerRect] = useState<DOMRect | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState(300); // 默认高度
  const [value, setValue] = useState(props.defaultValue)
  const [options, setOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    if (Array.isArray(props.options)) {
      setOptions(props.options)
    } else {
      props.options?.().then(res => {
        setOptions(res)
      })
    }
    const handleResize = () => {
      if (triggerRect) {
        const newMaxHeight = calculateMaxHeight(triggerRect);
        setMaxHeight(newMaxHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const calculateMaxHeight = useCallback((rect?: DOMRect) => {
    if (!rect) return 300;

    const screenHeight = window.innerHeight;
    const scrollY = window.scrollY

    const triggerTop = rect.top - scrollY;
    const triggerBottom = triggerTop + rect.height;

    const spaceBelow = screenHeight - triggerBottom;

    const availableSpace = Math.max(spaceBelow, triggerTop);
    const calculatedHeight = Math.min(availableSpace - 24, 500);

    return Math.max(calculatedHeight, 100);
  }, [])

  const getTriggerRect = useCallback(() => {
    if (dropdownRef.current) {
      return dropdownRef.current.nativeElement.getBoundingClientRect()
    }
    return undefined;
  }, []);

  const handleVisibleChange = useCallback((visible: boolean) => {
    if (visible) {
      const rect = getTriggerRect();
      setTriggerRect(rect);
      const newMaxHeight = calculateMaxHeight(rect);
      setMaxHeight(newMaxHeight);
    }
  }, [getTriggerRect, calculateMaxHeight]);

  const onChange = (value: string) => {
    setValue(value)
    props.onChange?.(value)
  }

  const Overlay = () => {
    return (
      <>
        <div className="kt-select-overlay" style={{maxHeight: maxHeight + 'px'}}>
          {options.map((option) => (
            <div className={option.value === value ? 'kt-select-dropdown-item selected' : 'kt-select-dropdown-item'}
                 key={option.value} onClick={() => onChange(option.value)}>{option.label}</div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <DropDown ref={dropdownRef} overlayClassName={'kt-select-dropdown scroller'} trigger={'click'}
                animation="slide-up" overlay={Overlay}
                onVisibleChange={handleVisibleChange}>
        <div className={'kt-select kt-input-cmp'}>
          <input className={'kt-select-inner'} value={value || ""} onChange={() => {
          }}/>
        </div>
      </DropDown>
    </>
  )
}