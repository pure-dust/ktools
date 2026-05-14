use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Response<T> {
    pub data: Option<T>,
    #[serde(rename = "errorMsg")]
    pub error_msg: String,
    #[serde(rename = "isSuccess")]
    pub is_success: bool,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all(serialize = "snake_case", deserialize = "camelCase"))]
#[serde(default)]
pub struct Chapter {
    base_url: String,
    book_url: String,
    end: i32,
    index: i32,
    is_pay: bool,
    is_vip: bool,
    is_volume: bool,
    start: i32,
    title: String,
    url: String,
}
