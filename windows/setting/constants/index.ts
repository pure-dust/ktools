export interface ConfigItem {
  name: string
  prop: string
  items: InputItem[]
}

export interface InputItem {
  name: string
  type: InputType
  prop: string
}

export enum InputType {
  color,
  number,
  select,
  shortcut,
  button
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
      {name: "字体颜色", type: InputType.color, prop: "font_color"},
      {name: "字体大小", type: InputType.number, prop: "font_size"},
      {name: "章节正则", type: InputType.select, prop: "regexp"},
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
