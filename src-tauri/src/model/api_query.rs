use reqwest::Body;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct BookType(pub i32);

#[allow(dead_code)]
impl BookType {
    /// 8 文本
    pub const TEXT: Self = Self(0b1000);
    /// 16 更新失败
    pub const UPDATE_ERROR: Self = Self(0b10000);
    /// 32 音频
    pub const AUDIO: Self = Self(0b100000);
    /// 64 图片
    pub const IMAGE: Self = Self(0b1000000);
    /// 128 只提供下载服务的网站
    pub const WEB_FILE: Self = Self(0b10000000);
    /// 256 本地
    pub const LOCAL: Self = Self(0b100000000);
    /// 512 压缩包
    pub const ARCHIVE: Self = Self(0b1000000000);
    /// 1024 未正式加入到书架的临时阅读书籍
    pub const NOT_SHELF: Self = Self(0b100_0000_0000);

    /// 所有可以从书源转换的书籍类型
    pub const ALL_BOOK_TYPE: Self =
        Self(Self::TEXT.0 | Self::IMAGE.0 | Self::AUDIO.0 | Self::WEB_FILE.0);

    /// 所有可以从书源转换的书籍类型（包含本地）
    pub const ALL_BOOK_TYPE_LOCAL: Self = Self(Self::ALL_BOOK_TYPE.0 | Self::LOCAL.0);

    /// 检查是否包含某个类型
    pub fn contains(&self, other: Self) -> bool {
        (self.0 & other.0) == other.0
    }

    /// 添加一个类型
    pub fn insert(&mut self, other: Self) {
        self.0 |= other.0;
    }

    /// 移除一个类型
    pub fn remove(&mut self, other: Self) {
        self.0 &= !other.0;
    }

    /// 获取所有包含的类型
    pub fn iter(&self) -> Vec<Self> {
        let mut types = Vec::new();
        if self.contains(Self::TEXT) {
            types.push(Self::TEXT);
        }
        if self.contains(Self::UPDATE_ERROR) {
            types.push(Self::UPDATE_ERROR);
        }
        if self.contains(Self::AUDIO) {
            types.push(Self::AUDIO);
        }
        if self.contains(Self::IMAGE) {
            types.push(Self::IMAGE);
        }
        if self.contains(Self::WEB_FILE) {
            types.push(Self::WEB_FILE);
        }
        if self.contains(Self::LOCAL) {
            types.push(Self::LOCAL);
        }
        if self.contains(Self::ARCHIVE) {
            types.push(Self::ARCHIVE);
        }
        if self.contains(Self::NOT_SHELF) {
            types.push(Self::NOT_SHELF);
        }
        types
    }
}

// 实现序列化和反序列化
impl<'de> Deserialize<'de> for BookType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = i32::deserialize(deserializer)?;
        Ok(BookType(value))
    }
}

impl Serialize for BookType {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i32(self.0)
    }
}
// Book 结构体
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "camelCase"))]
#[serde(default)]
pub struct Book {
    // 主键
    pub book_url: String,

    // 目录页URL
    pub toc_url: String,

    // 书源URL
    pub origin: String,

    // 书源名称
    pub origin_name: String,

    // 书籍名称
    pub name: String,

    // 作者名称
    pub author: String,

    // 分类信息
    pub kind: Option<String>,

    // 自定义标签
    pub custom_tag: Option<String>,

    // 封面URL
    pub cover_url: Option<String>,

    // 自定义封面URL
    pub custom_cover_url: Option<String>,

    // 简介内容
    pub intro: Option<String>,

    // 自定义简介
    pub custom_intro: Option<String>,

    // 字符集
    pub charset: Option<String>,

    // 书籍类型
    #[serde(rename = "type")]
    pub type_: BookType,

    // 分组
    pub group: i64,

    // 最新章节标题
    pub latest_chapter_title: Option<String>,

    // 最新章节标题更新时间
    pub latest_chapter_time: i64,

    // 最近一次更新书籍信息的时间
    pub last_check_time: i64,

    // 最近一次发现新章节的数量
    pub last_check_count: i32,

    // 书籍目录总数
    pub total_chapter_num: i32,

    // 当前章节名称
    pub dur_chapter_title: Option<String>,

    // 当前章节索引
    pub dur_chapter_index: i32,

    // 当前阅读的进度
    pub dur_chapter_pos: i32,

    // 最近一次阅读书籍的时间
    pub dur_chapter_time: i64,

    // 字数
    pub word_count: Option<String>,

    // 刷新书架时更新书籍信息
    pub can_update: bool,

    // 手动排序
    pub order: i32,

    // 书源排序
    pub origin_order: i32,

    // 自定义书籍变量信息
    pub variable: Option<String>,

    // 同步时间
    pub sync_time: i64,
    // // 以下是 @Ignore 标记的字段（不持久化）
    // #[serde(skip)]
    // pub variable_map: HashMap<String, String>,
    //
    // #[serde(skip)]
    // pub info_html: Option<String>,
    //
    // #[serde(skip)]
    // pub toc_html: Option<String>,
    //
    // #[serde(skip)]
    // pub download_urls: Option<Vec<String>>,
    //
    // #[serde(skip)]
    // pub folder_name: Option<String>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "camelCase"))]
#[serde(default)]
pub struct BookProgress {
    pub name: String,
    pub author: String,
    pub dur_chapter_index: i32,
    pub dur_chapter_pos: i32,
    pub dur_chapter_time: i64,
    pub dur_chapter_title: Option<String>,
}

impl From<BookProgress> for Body {
    fn from(progress: BookProgress) -> Self {
        let json = serde_json::to_string(&progress).unwrap_or_else(|_| "{}".to_string());
        Body::from(json)
    }
}

