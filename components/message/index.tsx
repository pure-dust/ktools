import './index.less';
import {useNotification} from "rc-notification";
import 'rc-notification/assets/index.less'
import {ReactNode, useMemo} from "react";

interface MessageProps {
  message: ReactNode;
  duration?: number;
}

type MessageMethod = (props: MessageProps | string) => void

interface MessageAPI {
  info: MessageMethod
  success: MessageMethod
  error: MessageMethod
  warning: MessageMethod

  [key: string]: MessageMethod
}

export function useMessage(): [MessageAPI, ReactNode] {

  const [originApi, holder] = useNotification({
    style: () => {
      return {
        left: '50%',
        transform: 'translateX(-50%)',
      }
    },
    className: () => {
      return 'kt-message'
    },
    motion: {
      motionName: 'kt-message-fade',
      motionAppear: true,
      motionEnter: true,
      motionLeave: true,
      onLeaveStart: (ele) => {
        const {offsetHeight} = ele;
        return {height: offsetHeight};
      },
      onLeaveActive: () => ({height: 0, opacity: 0, margin: 0}),
    },
    getContainer: () => document.body
  })

  const api = useMemo<MessageAPI>(() => {
    const methods = ['info', 'success', 'error', 'warning']
    return methods.reduce((acc, method) => {
      acc[method] = (props: MessageProps | string) => {
        originApi.open({
          className: `kt-message-content ${method}`,
          classNames: {
            wrapper: 'kt-message-wrapper'
          },
          content: typeof props === 'string' ? props : props.message,
          duration: typeof props === 'string' ? 3 : props.duration || 3
        })
      }
      return acc
    }, {} as MessageAPI)
  }, [])

  return [api, holder]
}
