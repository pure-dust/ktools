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
import {netNovel} from "~utils/net_novel.ts";

type ShortcutWrapper<T extends (...args: any) => any = (...args: any) => any> = (fn: T, type?: 'Released' | 'Pressed' | 'Pressing', exclude?: boolean) => T

let localMode: boolean = true

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
    if (!cache.get('novel.last') && localMode) {
      return
    }
    fn()
    await updateCache()
  }, type || 'Pressed', exclude)
}

const updateCache = async () => {
  if (localMode) {
    await cache.update(`novel.list.${filename(novel.path)}`, {
      path: novel.path,
      chapter: novel.chapter,
      line: novel.line,
    })
  } else {
    await netNovel.save_book_progress()
  }
}

function Novel() {
  const textRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState<string>(cache.get('novel.last'))
  const [color, setColor] = useState<string>(config.get('novel.font_color'))
  const [fontSize, setFontSize] = useState<number>(config.get('novel.font_size'))
  const [fontFamily, setFontFamily] = useState<string>(config.get('novel.font'))
  const [useAutosize, setUseAutosize] = useState<boolean>(config.get('novel.use_autosize'))
  const [scale, setScale] = useState<number>(1)
  const visible = useRef<boolean>(false)

  const currentWindow = useMemo(() => {
    return getCurrentWindow()
  }, [])

  const setWindowSize = async () => {
    if (!textRef.current) {
      return
    }
    let width = textRef.current.offsetWidth
    let height = textRef.current.offsetHeight
    if (useAutosize) {
      width = Math.ceil(width * scale)
      height = Math.ceil(height * scale)
    }
    await currentWindow.setSize(new PhysicalSize(width, height))
  }

  const hotkeyCallback = useMemo(() => {
    return {
      prev: novelEventWrapper(async () => {
        setText(localMode ? await novel.prevLine() : await netNovel.prevLine())
      }, "Released", true),
      next: novelEventWrapper(async () => {
        setText(localMode ? await novel.nextLine() : await netNovel.nextLine())
      }, "Released", true),
      prev_chapter: novelEventWrapper(async () => {
        setText(localMode ? await novel.prevChapter() : await netNovel.prevChapter())
      }, "Released", true),
      next_chapter: novelEventWrapper(async () => {
        setText(localMode ? await novel.nextChapter() : await netNovel.nextChapter())
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

      currentWindow.onFocusChanged((event) => {
        if (event.payload) {
          visible.current = true
        }
      }).then()
      await init()
      setScale(await invoke<number>("get_dpi_scale") || 1)
      config.on('novel.font_color', ([_target, _key, color]) => {
        setColor(color)
      })
      config.on('novel.font_size', ([_target, _key, size]) => {
        setFontSize(size)
      })
      config.on('novel.font', ([_target, _key, font]) => {
        setFontFamily(font)
      })
      config.on("novel.use_autosize", async ([_target, _key, use_autosize]) => {
        setWindowSize()
        setUseAutosize(use_autosize)
      })
      config.on('novel.window_width', ([_target, _key, width]) => {
        if (!useAutosize) {
          currentWindow.setSize(new PhysicalSize(width, config.get('novel.window_height')))
        }
      })
      config.on('novel.window_height', ([_target, _key, height]) => {
        if (!useAutosize) {
          currentWindow.setSize(new PhysicalSize(config.get('novel.window_width'), height))
        }
      })
      cache.on("novel.last", () => {
        localMode = true
        init()
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
        if (!visible.current) {
          return
        }
        if (localMode && !cache.get('novel.last')) {
          return
        }

        if (event.payload > 0) {
          setText(localMode ? await novel.prevLine() : await netNovel.prevLine())
        } else {
          setText(localMode ? await novel.nextLine() : await netNovel.nextLine())
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

      listen<Book>("set_novel_book", async (event) => {
        setText(event.payload.name)
        await netNovel.set_book(event.payload)
        localMode = false
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
    if (!useAutosize) {
      return
    }
    setWindowSize()
  }, [fontSize, fontFamily, text]);

  return (
    <>
      <div className={'kt-novel'} style={{color, fontSize, fontFamily}} ref={textRef}
           data-tauri-drag-region={true}>{text}</div>
    </>
  )
}

export default Novel