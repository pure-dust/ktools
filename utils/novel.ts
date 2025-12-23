import {invoke} from "@tauri-apps/api/core";
import {emit} from "@tauri-apps/api/event";
import {debounce, filename} from "~utils/utils.ts";
import {config} from "~utils/config.ts";

interface NovelConfig {
  path: string
  count: number
  chapter: number
  line: number
  regexp: string
}

class Novel {
  private static instance: Novel;
  private config: NovelConfig = {
    path: '',
    count: 30,
    chapter: -1,
    line: -1,
    regexp: ""
  }
  private chapters: string[] = []
  private currentChapter: number = -1
  private currentLine: number = -1
  private currentContent: string = ''
  private lines: string[] = []
  private error?: string

  private update = debounce(async () => {
    await emit("change-tip", {
      name: filename(this.config.path),
      chapter: this.currentChapter + 1,
      line: this.currentLine + 1,
      title: this.chapters[this.currentChapter]?.trim() || "尚未开始阅读"
    })
  }, 1000)

  constructor() {
    if (!Novel.instance) {
      Novel.instance = this;
    }
    return Novel.instance;
  }

  get path() {
    return this.config.path
  }

  get line() {
    return this.currentLine
  }

  get chapter() {
    return this.currentChapter
  }

  async init(novelConfig: Partial<NovelConfig>) {
    this.error = undefined
    this.config = Object.assign(this.config, novelConfig)
    if (!this.config.regexp) {
      this.config.regexp = config.get('novel.regexp')
    }
    this.currentChapter = this.config.chapter
    this.currentLine = this.config.line
    this.currentContent = ""
    this.lines = []
    try {
      this.chapters = await invoke("init", {config: {path: this.config.path, regexp: this.config.regexp}})
      if (this.currentLine >= 0 && this.currentChapter >= 0) {
        this.currentContent = await invoke<string>("chapter", {title: this.chapters[this.currentChapter]})
        this.parseChapter()
      }
      await this.update()
    } catch (error) {
      this.error = error as string
      console.error(error);
    }
  }

  async prevChapter(auto?: boolean) {
    if (this.error) {
      return this.error
    }
    if (this.currentChapter > 0) {
      this.currentChapter--
      await this.getChapter()
      this.currentLine = auto ? this.lines.length - 1 : 0
      await this.update()
      return this.lines[this.currentLine]
    } else {
      this.currentChapter = -1
      this.currentLine = -1
      await this.update()
      return filename(this.path)
    }
  }

  async nextChapter() {
    if (this.error) {
      return this.error
    }
    if (this.currentChapter < this.chapters.length - 1) {
      this.currentChapter++
      this.currentLine = 0
      await this.getChapter()
      await this.update()
      return this.lines[this.currentLine]
    } else {
      this.currentChapter = this.chapters.length - 1
      this.currentLine = this.lines.length - 1
      await this.update()
      return filename(this.path)
    }
  }

  async prevLine() {
    if (this.error) {
      return this.error
    }
    if (this.currentLine > 0) {
      this.currentLine--
      await this.update()
      return this.lines[this.currentLine]
    } else {
      return await this.prevChapter(true)
    }
  }

  async nextLine() {
    if (this.error) {
      return this.error
    }
    if (this.currentLine < this.lines.length - 1) {
      this.currentLine++
      await this.update()
      return this.lines[this.currentLine]
    } else {
      return await this.nextChapter()
    }
  }

  private async getChapter() {
    try {
      this.currentContent = await invoke<string>("chapter", {title: this.chapters[this.currentChapter]})
      this.parseChapter()
      this.error = undefined
    } catch (error) {
      this.error = error as string
      console.error(error);
    }
  }

  private parseChapter() {
    this.lines = []
    if (this.currentChapter < 0 || this.currentChapter >= this.chapters.length) {
      return
    }
    this.lines.push(this.chapters[this.currentChapter] + "\n")
    const {count} = this.config
    this.currentContent.split(/\n/).forEach(c => {
      let i = 0
      let s = c.slice(i * count, (i + 1) * count)
      while (s) {
        this.lines.push(s.trim())
        i++
        s = c.slice(i * count, (i + 1) * count)
      }
    })
  }
}

export const novel = new Novel()