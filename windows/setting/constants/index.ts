import {useEffect, useState} from "react";
import {config} from "~utils/config.ts";
import {pluginLoader} from "~utils/plugin.ts";

export interface ConfigItem {
  name: string
  prop: string
  items: InputItem[]
}

export interface InputItem {
  name: string
  type: InputType
  prop: keyof AppConfig | keyof NovelConfig | keyof ShortcutConfig | keyof OtherConfig
  option?: string
  other?: any
  disabled?: boolean
}

export enum InputType {
  color,
  number,
  select,
  shortcut,
  button,
  switch,
}


export const SETTING_CONFIG: ConfigItem[] = [
  {
    name: "应用",
    prop: "app",
    items: [],
  },
  {
    name: "主题",
    prop: "theme",
    items: [],
  },
  {
    name: "小说",
    prop: "novel",
    items: [
      {
        name: "字体",
        type: InputType.select,
        prop: "font",
        option: "get_system_fonts",
        other: {select: true}
      },
      {name: "字体颜色", type: InputType.color, prop: "font_color"},
      {name: "字体大小", type: InputType.number, prop: "font_size"},
      {name: "章节正则", type: InputType.select, prop: "regexp"},
      {name: "每行字数", type: InputType.number, prop: "count"},
      {name: "是否启用鼠标滚轮翻页", type: InputType.switch, prop: "use_scroll"},
      {name: "是否启用窗口自适应", type: InputType.switch, prop: "use_autosize"},
      {name: "窗口长度", type: InputType.number, prop: "window_width"},
      {name: "窗口高度", type: InputType.number, prop: "window_height"},
    ],
  },
  {
    name: "快捷键",
    prop: "shortcut",
    items: [
      {name: "上一行", type: InputType.shortcut, prop: "prev"},
      {name: "下一行", type: InputType.shortcut, prop: "next"},
      {name: "上一章", type: InputType.shortcut, prop: "prev_chapter"},
      {name: "下一章", type: InputType.shortcut, prop: "next_chapter"},
      {name: "老板键", type: InputType.shortcut, prop: "hide"},
      {name: "窗口左移", type: InputType.shortcut, prop: "left"},
      {name: "窗口上移", type: InputType.shortcut, prop: "up"},
      {name: "窗口右移", type: InputType.shortcut, prop: "right"},
      {name: "窗口下移", type: InputType.shortcut, prop: "down"},
    ],
  },
  {
    name: "其他",
    prop: "other",
    items: [
      {name: "缓存管理", type: InputType.button, prop: "cache"}
    ],
  },
]

export const useSetting = () => {
  const [setting, setSetting] = useState<ConfigItem[]>(SETTING_CONFIG)

  useEffect(() => {
    let plugins = pluginLoader.getPluginSettings()
    for (const [key, pluginSetting] of plugins) {
      let category = setting.find(s => s.prop === pluginSetting.category)
      if (category && category.items.findIndex(item => item.prop === key) === -1) {
        category.items.push({
          name: pluginSetting.name,
          type: pluginSetting.type,
          prop: key,
        })
      }
    }
    setting[2].items[7].disabled = config.get('novel.use_autosize')
    setting[2].items[8].disabled = config.get('novel.use_autosize')
    setSetting([...setting])
    const onChange = ([_target, _key, value]: [string, string, boolean]) => {
      setting[2].items[7].disabled = value
      setting[2].items[8].disabled = value
      setSetting([...setting])
    }
    config.on('novel.use_autosize', onChange)

    return () => {
      config.off('novel.use_autosize', onChange)
    }
  }, []);

  return setting
}


