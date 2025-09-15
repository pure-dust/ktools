import {useCallback, useEffect, useMemo, useState} from "react";
import {getCurrentWindow, PhysicalPosition} from "@tauri-apps/api/window";
import {open} from "@tauri-apps/plugin-dialog"
import {hotkey} from "~utils/hotkey.ts";
import {novel} from "~utils/novel.ts";
import {cache, config} from "~utils/config.ts";
import './index.less'
import {listen} from "@tauri-apps/api/event";
import {filename} from "~utils/utils.ts";

type ShortcutWrapper<T extends (...args: any) => any = (...args: any) => any> = (fn: T, type?: 'Released' | 'Pressed' | 'Pressing') => T

const shortcutWrapper: ShortcutWrapper = (fn, type?: 'Released' | 'Pressed' | 'Pressing') => {
  return (state: 'Released' | 'Pressed' | 'Pressing') => {
    if (!type) {
      fn()
    } else if (type === state) {
      fn()
    }
  }
}

const novelEventWrapper = (fn: Function) => {
  return shortcutWrapper(async () => {
    if (!cache.get('novel.last')) {
      return
    }
    fn()
    await updateCache()
  }, 'Pressed')
}

const updateCache = async () => {
  await cache.update(`novel.list.${filename(novel.path)}`, {
    path: novel.path,
    chapter: novel.chapter,
    line: novel.line,
  })
}

export function Novel() {
  const [text, setText] = useState<string>(cache.get('novel.last'))
  const [color, setColor] = useState<string>(config.get('novel.font_color'))
  const [fontSize, setFontSize] = useState<number>(config.get('novel.font_size'))

  const currentWindow = useMemo(() => {
    return getCurrentWindow()
  }, [])

  const hotkeyCallback = useMemo(() => {
    return {
      prev: novelEventWrapper(async () => {
        setText(await novel.prevLine())
      }),
      next: novelEventWrapper(async () => {
        setText(await novel.nextLine())
      }),
      prev_chapter: novelEventWrapper(async () => {
        setText(await novel.prevChapter())
      }),
      next_chapter: novelEventWrapper(async () => {
        setText(await novel.nextChapter())
      }),
      hide: shortcutWrapper(async () => {
        if (await currentWindow.isVisible()) {
          await currentWindow.hide()
        } else {
          await currentWindow.show()
        }
      }, "Pressed"),
      up: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x, origin.y - 1))
      }),
      left: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x - 1, origin.y))
      }),
      right: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x + 1, origin.y))
      }),
      down: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x, origin.y + 1))
      })
    }
  }, [])

  const init = useCallback(async () => {
    await cache.init()
    const name = cache.get('novel.last')
    if (!name) {
      setText("请选择书籍")
      return
    }

    let cacheItem = cache.get<NovelItemCache>(`novel.list.${name}`)

    await novel.init({
      path: cacheItem.path,
      chapter: cacheItem.chapter,
      line: cacheItem.line,
      count: config.get('novel.count')
    })
    setText(filename(novel.path))
  }, [])

  useEffect(() => {
    config.on('novel.font_color', ([_target, _key, color]) => {
      setColor(color)
    })
    config.on('novel.font_size', ([_target, _key, size]) => {
      setFontSize(size)
    })

    listen('select', async () => {
      let result = await open()
      if (!result) {
        return
      }
      let cacheItem = cache.get<NovelItemCache | undefined>(`novel.list.${filename(result)}`)
      await novel.init({
        path: result,
        chapter: cacheItem?.chapter ?? -1,
        line: cacheItem?.line ?? -1,
        count: config.get('novel.count'),
      })
      await cache.update('novel.last', filename(result))
      if (!cacheItem) {
        await cache.update(`novel.list.${filename(result)}`, {
          path: result,
          chapter: 0,
          line: 0,
        })
      }
      setText(filename(novel.path))
    }).then()

    listen('reload', async () => {
      await cache.reload()
      await init()
    }).then()

    for (const [key, cb] of Object.entries(hotkeyCallback)) {
      hotkey.on(key, cb)
    }

    init().then()

    return () => {
      for (const [key, cb] of Object.entries(hotkeyCallback)) {
        hotkey.off(key, cb)
      }
    }
  }, []);

  return (
    <div className={'kt-novel'} style={{color, fontSize}}
         data-tauri-drag-region={true}>{text}</div>
  )
}