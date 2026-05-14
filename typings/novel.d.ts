interface NovelResponse<T> {
  data: T,
  error_msg: String,
  is_success: boolean,
}

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

interface Book {
  // 主键
  bookUrl: string;

  // 目录页URL
  tocUrl: string;

  // 书源URL
  origin: string;

  // 书源名称
  originName: string;

  // 书籍名称
  name: string;

  // 作者名称
  author: string;

  // 分类信息
  kind?: string;

  // 自定义标签
  customTag?: string;

  // 封面URL
  coverUrl?: string;

  // 自定义封面URL
  customCoverUrl?: string;

  // 简介内容
  intro?: string;

  // 自定义简介
  customIntro?: string;

  // 字符集
  charset?: string;

  // 书籍类型
  type: BookType; // BookType 枚举保持不变

  // 分组
  group: number; // i64 在 TS 中用 number 表示（注意精度问题）

  // 最新章节标题
  latestChapterTitle?: string;

  // 最新章节标题更新时间
  latestChapterTime: number; // 时间戳（毫秒）

  // 最近一次更新书籍信息的时间
  lastCheckTime: number; // 时间戳（毫秒）

  // 最近一次发现新章节的数量
  lastCheckCount: number;

  // 书籍目录总数
  totalChapterNum: number;

  // 当前章节名称
  durChapterTitle?: string;

  // 当前章节索引
  durChapterIndex: number;

  // 当前阅读的进度
  durChapterPos: number;

  // 最近一次阅读书籍的时间
  durChapterTime: number; // 时间戳（毫秒）

  // 字数
  wordCount?: string;

  // 刷新书架时更新书籍信息
  canUpdate: boolean;

  // 手动排序
  order: number;

  // 书源排序
  originOrder: number;

  // 自定义书籍变量信息
  variable?: string;

  // 同步时间
  syncTime: number; // 时间戳（毫秒）
}

interface Chapter {
  base_url: string;
  book_url: string;
  end: number;
  index: number;
  is_pay: boolean;
  is_vip: boolean;
  is_volume: boolean;
  start: number;
  title: string;
  url: string;
}

interface BookProgress {
  name: string,
  author: string,
  durChapterIndex: number,
  durChapterPos: number,
  durChapterTime: number,
  durChapterTitle?: string,
}