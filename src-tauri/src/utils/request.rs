use crate::model::api_result::Response;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt::Debug;

static CLIENT: Lazy<reqwest::Client> = Lazy::new(|| reqwest::Client::new());

#[derive(Debug)]
pub struct RequestOption {
    pub method: reqwest::Method,
    pub url: String,
    pub query: Option<Vec<(String, String)>>,
    pub body: Option<String>,
    pub headers: Option<reqwest::header::HeaderMap>,
    pub timeout: Option<u64>,
}

pub async fn request<T>(option: RequestOption) -> Result<Response<T>, Box<dyn Error>>
where
    T: for<'de> Deserialize<'de>,
    T: for<'de> Serialize,
    T: Debug,
{
    let mut req = CLIENT.request(option.method, option.url);
    if let Some(query) = option.query {
        req = req.query(&query);
    }
    if let Some(body) = option.body {
        req = req.body(body);
    }
    if let Some(headers) = option.headers {
        req = req.headers(headers);
    }
    if let Some(timeout) = option.timeout {
        req = req.timeout(std::time::Duration::from_secs(timeout));
    }
    let response_text = req.send().await?.text().await?;
    let response: Response<T> = serde_json::from_str(&response_text)?;

    Ok(response)
}
