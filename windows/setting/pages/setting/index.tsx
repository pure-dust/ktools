import {useCallback, useEffect, useState} from "react";
import './index.less'
import {InputItem, InputType, SETTING_CONFIG} from '~setting/constants'
import {Button, ColorPicker, InputNumber, Modal, Select, Shortcut, Switch} from '~components/index'
import {cache, config} from "~utils/config.ts";
import {debounce, filename} from "~utils/utils.ts";
import {useMessage} from "~components/message";
import {invoke} from "@tauri-apps/api/core";
import {AppFonts} from "~setting/pages/preview";

export default function Setting() {
  const [visible, setVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [current, setCurrent] = useState<NovelItemCache>()
  const [novelCache, setNovelCache] = useState<NovelCache>(cache.get('novel'))
  const [api, holder] = useMessage()

  useEffect(() => {
    const callback = () => {
      setNovelCache(cache.get('novel'))
    }
    cache.on('novel', callback)
    return () => {
      cache.off('novel', callback)
    }
  }, []);

  const onDelete = async (type?: number) => {
    let name = filename(current!.path)
    if (type === 1) {
      delete novelCache.list[name]
      if (novelCache.last === current!.path) {
        novelCache.last = ''
      }
      await cache.update('novel', novelCache)
      api.success('删除成功！')
    } else if (type === 2) {
      delete novelCache.list[name]
      if (novelCache.last === current!.path) {
        novelCache.last = ''
      }
      await cache.update('novel', novelCache)
      if (await invoke<boolean>('remove', {path: current!.path})) {
        api.success('删除成功！')
      } else {
        api.error('删除源文件失败！请尝试手动删除！')
      }
    }
    setDeleteVisible(false)
    setCurrent(undefined)
  }

  const buildConfigItem = useCallback((parent: string, item: InputItem) => {

    const onChange = async (value: string | number | boolean) => {
      await config.update(`${parent}.${item.prop}`, value)
    }

    const updateColor = debounce(onChange, 300)

    let option: SelectOption[] | RemoteRequest<SelectOption[]> = []
    if (item.type === InputType.select) {
      if (item.option) {
        option = () => {
          return new Promise((resolve, reject) => {
            invoke<string[]>(item.option!).then(res => {
              resolve(res.concat(AppFonts).map(item => ({
                label: item,
                value: item
              })))
            }).catch(reject)
          })
        }
      } else {
        option = config.get<string[]>(`${parent}.${item.prop}_options`).map(item => ({
          label: item,
          value: item
        }))
      }
    }

    if (item.type === InputType.color) {
      return <ColorPicker defaultValue={config.get(`${parent}.${item.prop}`)}
                          onChange={updateColor} {...(item.other || {})}/>
    } else if (item.type === InputType.number) {
      return <InputNumber defaultValue={config.get(`${parent}.${item.prop}`)}
                          onChange={onChange} {...(item.other || {})}/>
    } else if (item.type === InputType.select) {
      return <Select defaultValue={config.get(`${parent}.${item.prop}`)}
                     options={option} onChange={onChange} {...(item.other || {})}/>
    } else if (item.type === InputType.shortcut) {
      return <Shortcut defaultValue={config.get(`${parent}.${item.prop}`)} onChange={onChange} {...(item.other || {})}/>
    } else if (item.type === InputType.button) {
      return (<Button block onClick={() => setVisible(true)} {...(item.other || {})}>{item.name}</Button>)
    } else if (item.type === InputType.switch) {
      return (<Switch defaultValue={config.get(`${parent}.${item.prop}`)}
                      onChange={onChange} {...(item.other || {})}></Switch>)
    }
  }, [])

  return (
    <>
      <div className={'setting-page'}>
        {SETTING_CONFIG.map(item => {
          return <div className={'setting-card'} key={item.prop}>
            <div className={'setting-card-title zcoo'}>{item.name}</div>
            <div className={'setting-card-content'}>
              {item.items.map(el => {
                return <div className={'setting-card-item'} key={el.prop}>
                  <div className={'setting-card-item-name zcoo'}>{el.name}</div>
                  {buildConfigItem(item.prop, el)}
                </div>
              })}
            </div>
          </div>
        })}
      </div>
      <Modal height={'80%'} width={420} rootClassName={'cache-wrapper'} title={'缓存管理'} visible={visible}
             onClose={() => setVisible(false)}>
        <div className={'cache-item'} style={{color: '#63a8ee'}}>
          <div className="cache-item-title">上次看到：</div>
          <div className="cache-item-content">{filename(novelCache.last) || '暂无观看记录'}</div>
        </div>
        {Object.values(novelCache.list).map((item) => (
          <div className={'cache-item'} key={item.path}>
            <div className="cache-item-title"></div>
            <div className="cache-item-content">{filename(item.path)}</div>
            <div className="cache-item-delete">
              <Button type={'danger'} size={'small'} onClick={() => {
                setDeleteVisible(true)
                setCurrent(item)
              }}>删除</Button>
            </div>
          </div>
        ))}
      </Modal>
      <Modal visible={deleteVisible} title={'确认删除？'} onClose={() => setDeleteVisible(false)}>
        <Button style={{marginBottom: 6}} type={'danger'} onClick={() => onDelete(1)}>删除（仅删除记录）</Button>
        <Button style={{marginBottom: 6}} type={'danger'}
                onClick={() => onDelete(2)}>删除（删除记录和源文件）</Button>
        <Button onClick={() => onDelete()}>取消（取消本次操作）</Button>
      </Modal>
      {holder}
    </>
  )
}