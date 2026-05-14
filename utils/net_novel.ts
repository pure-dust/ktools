import {config} from "~utils/config.ts";
import {get_book_content, get_bookshelf, get_chapter_list, save_book_progress, set_address_port} from "../api/novel.ts";
import {debounce} from "~utils/utils.ts";
import {emit} from "@tauri-apps/api/event";
import {invoke} from "@tauri-apps/api/core";

enum BookType {
  Text = 0b1000,           // 8 文本
  UpdateError = 0b10000,    // 16 更新失败
  Audio = 0b100000,         // 32 音频
  Image = 0b1000000,        // 64 图片
  WebFile = 0b10000000,     // 128 只提供下载服务的网站
  Local = 0b100000000,      // 256 本地
  Archive = 0b1000000000,   // 512 压缩包
  NotShelf = 0b100_0000_0000, // 1024 未正式加入到书架的临时阅读书籍
}

class NetNovel {
  private static instance: NetNovel
  private address: string = ""
  private port: string = ""
  private book: Book = {
    author: "",
    bookUrl: "",
    canUpdate: false,
    durChapterIndex: 0,
    durChapterPos: 0,
    durChapterTime: 0,
    group: 0,
    lastCheckCount: 0,
    lastCheckTime: 0,
    latestChapterTime: 0,
    name: "",
    order: 0,
    origin: "",
    originName: "",
    originOrder: 0,
    syncTime: 0,
    tocUrl: "",
    totalChapterNum: 0,
    type: BookType.Text
  }
  private content: string = ""
  private chapters: Chapter[] = []
  private lines: string[] = []
  private currentLine: number = -1
  private currentChapter: number = -1

  private update = debounce(async () => {
    await emit("change-tip", {
      name: this.book.name,
      title: this.chapters[this.currentChapter]?.title?.trim() || "无",
      chapter: this.currentChapter + 1,
      line: this.currentLine + 1,
      len: this.chapters.length,
    })
  }, 1000)

  constructor() {
    if (!NetNovel.instance) {
      NetNovel.instance = this
      config.on("net_novel.net_address", ([_target, _key, address]) => {
        this.address = address
        this.init()
      })
      config.on("net_novel.net_port", ([_target, _key, port]) => {
        this.port = port
        this.init()
      })
    }
    return NetNovel.instance
  }

  async init() {
    this.address = config.get("net_novel.net_address")
    this.port = config.get("net_novel.net_port")
    if (this.address && this.port) {
      await set_address_port(this.address, this.port).then()
    }
  }

  async set_book(book: Book) {
    this.book = book
    this.currentLine = -1
    this.currentChapter = book.durChapterIndex
    await this.save_book()
    await this.get_chapter_list(this.book.bookUrl)
    await this.get_chapter_content(this.book.bookUrl, this.currentChapter)
    await this.update()

  }

  get_bookshelf() {
    return get_bookshelf()
  }

  async save_book() {
    await invoke("save_book", {book: this.book})
  }

  async get_chapter_list(url: string) {
    this.chapters = (await get_chapter_list(url)).data
  }

  async get_chapter_content(url: string, index: number) {
    let count = config.get<number>('novel.count')
    let content = (await get_book_content(url, index)).data
    this.lines = []
    this.content = content
    this.content.split(/\n/).forEach(c => {
      let i = 0
      let s = c.slice(i * count, (i + 1) * count)
      while (s) {
        this.lines.push(s.trim())
        i++
        s = c.slice(i * count, (i + 1) * count)
      }
    })
  }

  save_book_progress() {
    return save_book_progress({
      name: this.book.name,
      author: this.book.author,
      durChapterIndex: this.book.durChapterIndex,
      durChapterPos: 0,
      durChapterTime: new Date().getTime(),
      durChapterTitle: this.chapters[this.currentChapter]?.title,
    })
  }

  async prevChapter(auto?: boolean) {
    if (this.currentChapter > 0) {
      this.currentChapter--
      await this.get_chapter_content(this.book.bookUrl, this.currentChapter)
      this.currentLine = auto ? this.lines.length - 1 : 0
      await this.update()

      return this.lines[this.currentLine]
    } else {
      this.currentChapter = -1
      this.currentLine = -1
      return this.book.name
    }
  }

  async nextChapter() {
    if (this.currentChapter < this.chapters.length - 1) {
      this.currentChapter++
      this.currentLine = 0
      await this.get_chapter_content(this.book.bookUrl, this.currentChapter)
      await this.update()

      return this.lines[this.currentLine]
    } else {
      this.currentChapter = this.chapters.length - 1
      this.currentLine = this.lines.length - 1
      return this.book.name
    }
  }

  async prevLine() {
    if (this.currentLine > 0) {
      this.currentLine--
      await this.update()
      return this.lines[this.currentLine]
    } else {
      return await this.prevChapter(true)
    }
  }

  async nextLine() {
    if (this.currentLine < this.lines.length - 1) {
      this.currentLine++
      await this.update()
      return this.lines[this.currentLine]
    } else {
      return await this.nextChapter()
    }
  }

}

export const netNovel = new NetNovel()