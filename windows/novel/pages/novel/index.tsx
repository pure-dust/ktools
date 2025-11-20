import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getCurrentWindow, PhysicalPosition, PhysicalSize} from "@tauri-apps/api/window";
import {open} from "@tauri-apps/plugin-dialog"
import {hotkey} from "~utils/hotkey.ts";
import {novel} from "~utils/novel.ts";
import {cache, config} from "~utils/config.ts";
import './index.less'
import {listen} from "@tauri-apps/api/event";
import {filename} from "~utils/utils.ts";
import {invoke} from "@tauri-apps/api/core";

type ShortcutWrapper<T extends (...args: any) => any = (...args: any) => any> = (fn: T, type?: 'Released' | 'Pressed' | 'Pressing', exclude?: boolean) => T

const shortcutWrapper: ShortcutWrapper = (fn, type?: 'Released' | 'Pressed' | 'Pressing', exclude?: boolean) => {
  return (state: 'Released' | 'Pressed' | 'Pressing') => {
    if (exclude && type !== state) {
      fn()
    } else if (exclude && type === state) {
      return
    } else if (type === state) {
      fn()
    } else if (!type) {
      fn()
    }
  }
}

const novelEventWrapper = (fn: Function, type?: 'Released' | 'Pressed' | 'Pressing', exclude?: boolean) => {
  return shortcutWrapper(async () => {
    if (!cache.get('novel.last')) {
      return
    }
    fn()
    await updateCache()
  }, type || 'Pressed', exclude)
}

const updateCache = async () => {
  await cache.update(`novel.list.${filename(novel.path)}`, {
    path: novel.path,
    chapter: novel.chapter,
    line: novel.line,
  })
}

export function Novel() {
  const textRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState<string>(cache.get('novel.last'))
  const [color, setColor] = useState<string>(config.get('novel.font_color'))
  const [fontSize, setFontSize] = useState<number>(config.get('novel.font_size'))
  const [fontFamily, setFontFamily] = useState<string>(config.get('novel.font'))
  const visible = useRef<boolean>(false)

  const currentWindow = useMemo(() => {
    return getCurrentWindow()
  }, [])

  const hotkeyCallback = useMemo(() => {
    return {
      prev: novelEventWrapper(async () => {
        setText(await novel.prevLine())
      }, "Released", true),
      next: novelEventWrapper(async () => {
        setText(await novel.nextLine())
      }, "Released", true),
      prev_chapter: novelEventWrapper(async () => {
        setText(await novel.prevChapter())
      }, "Released", true),
      next_chapter: novelEventWrapper(async () => {
        setText(await novel.nextChapter())
      }, "Released", true),
      hide: shortcutWrapper(async () => {
        if (await currentWindow.isVisible()) {
          await currentWindow.hide()
          visible.current = false
        } else {
          await currentWindow.show()
          visible.current = true
        }
      }, "Pressed"),
      up: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x, origin.y - 1))
      }, "Released", true),
      left: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x - 1, origin.y))
      }, "Released", true),
      right: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x + 1, origin.y))
      }, "Released", true),
      down: shortcutWrapper(async () => {
        let origin = await currentWindow.outerPosition()
        await currentWindow.setPosition(new PhysicalPosition(origin.x, origin.y + 1))
      }, "Released", true)
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
    const initialize = async () => {
      visible.current = await currentWindow.isVisible()
      await init()

      config.on('novel.font_color', ([_target, _key, color]) => {
        setColor(color)
      })
      config.on('novel.font_size', ([_target, _key, size]) => {
        setFontSize(size)
      })
      config.on('novel.font', ([_target, _key, font]) => {
        setFontFamily(font)
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

      listen<number>("scroll", async (event) => {
        if (!config.get('novel.use_scroll')) {
          return
        }
        if (!visible.current || !cache.get('novel.last')) {
          return
        }

        if (event.payload > 0) {
          setText(await novel.prevLine())
        } else {
          setText(await novel.nextLine())
        }
        await updateCache()
      }).then()

      listen<void>("hide", async (_event) => {
        if (await currentWindow.isVisible()) {
          await currentWindow.hide()
          visible.current = false
        } else {
          await currentWindow.show()
          visible.current = true
        }
      }).then()

      for (const [key, cb] of Object.entries(hotkeyCallback)) {
        hotkey.on(key, cb)
      }

      invoke("start_mouse_wheel").then()

    }

    initialize().then()
    return () => {
      for (const [key, cb] of Object.entries(hotkeyCallback)) {
        hotkey.off(key, cb)
      }
    }
  }, []);

  useEffect(() => {
    if (!textRef.current) {
      return
    }
    getCurrentWindow().setSize(new PhysicalSize(textRef.current.offsetWidth, textRef.current.offsetHeight)).then()
  }, [fontSize, fontFamily, text]);

  return (
    <>
      <div className={'kt-novel'} style={{color, fontSize, fontFamily}} ref={textRef}
           data-tauri-drag-region={true}>{text}</div>
    </>
  )
}