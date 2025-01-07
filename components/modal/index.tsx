import {PropsWithChildren, ReactNode} from "react";
import Dialog from "rc-dialog";
import 'rc-dialog/assets/index.css'
import './index.less'
import {IDialogPropTypes} from "rc-dialog/es/IDialogPropTypes";

interface ModalProps extends PropsWithChildren, IDialogPropTypes {
  title?: string | ReactNode;
  footer?: ReactNode;
  width?: number | string;
  height?: number | string;
  visible?: boolean;
  onClose?: () => void;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  mask?: boolean;
}

export function Modal(props: ModalProps) {

  return <Dialog {...props} animation={'zoom'} maskAnimation={'fade'}
                 classNames={{wrapper: 'modal-wrapper', content: 'modal-body '}}>
    {props.children}
    {props.footer && <div className="footer">
    </div>}
  </Dialog>
}