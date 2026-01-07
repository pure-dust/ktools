

interface PluginInfo {
  name: string;
  description: string;
  version: string;
  src: string
}

interface AddSettingProps {
  category: "app" | "theme" | "novel" | "shortcut" | "other"
  name: string
  type: number
  prop: string
}