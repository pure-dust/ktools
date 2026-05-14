use serde::{Deserialize, Serialize};

pub const PLUGIN_DIR: &str = "plugins";
pub const DEFAULT_REGEXP: &str = r"第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*";

#[derive(Deserialize, Serialize)]
pub struct NovelConfig {
    pub font_color: String,
    pub font_size: i32,
    pub regexp: String,
    pub regexp_options: Vec<String>,
    pub count: i32,
    pub use_scroll: bool,
    pub use_autosize: bool,
    pub window_width: i32,
    pub window_height: i32,
}

#[derive(Deserialize, Serialize)]
pub struct AppConfig {
    pub novel: NovelConfig,
}
