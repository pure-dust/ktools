interface AppConfig extends Record<string, any> {

}

interface ThemeConfig extends Record<string, any> {

}

interface NovelConfig extends Record<string, any> {
  font_color: string,
  font_size: number
  regexp: string
  regexp_options: string[]
  count: number
  use_scroll: boolean
  use_autosize: boolean
  window_width: number
  window_height: number
}

interface ShortcutConfig extends Record<string, any> {
  prev: string
  next: string
  prev_chapter: string
  next_chapter: string
  hide: string
  up: string
  left: string
  right: string
  down: string
}

interface OtherConfig {

}

interface NetNovelConfig {
  address: string
  port: string
}

interface Config {
  app: Partial<AppConfig>
  theme: Partial<ThemeConfig>
  novel: Partial<NovelConfig>
  net_novel: Partial<NetNovelConfig>
  shortcut: Partial<ShortcutConfig>
  other: Partial<OtherConfig>
}

interface NovelItemCache extends Record<string, string | number> {
  path: string
  chapter: number
  line: number
}

interface NovelCache {
  last?: string,
  regexp: string
  list: {
    [key: string]: NovelItemCache
  }
}

interface AppCache {
  novel: NovelCache
}
