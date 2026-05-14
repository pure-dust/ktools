use crate::model::api_query::{Book, BookProgress};
use crate::model::api_result::{Chapter, Response};
use crate::utils::request::{request, RequestOption};
use reqwest::Method;
use std::sync::Mutex;

static ADDRESS: Mutex<String> = Mutex::new(String::new());
static PORT: Mutex<String> = Mutex::new(String::new());

#[tauri::command]
pub fn set_address_port(address: &str, port: &str) {
    let mut o_a = ADDRESS.lock().unwrap();
    *o_a = address.to_string();
    let mut o_port = PORT.lock().unwrap();
    *o_port = port.to_string();
}

#[tauri::command]
pub async fn save_book(book: Book) -> Result<Response<String>, String> {
    let option = RequestOption {
        url: format!(
            "http://{}:{}/saveBook",
            ADDRESS.lock().unwrap(),
            PORT.lock().unwrap()
        ),
        method: Method::POST,
        query: None,
        body: Some(serde_json::to_string(&book).unwrap()),
        headers: None,
        timeout: Some(5),
    };

    match request::<String>(option).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_book() {}

#[tauri::command]
pub async fn get_bookshelf() -> Result<Response<Vec<Book>>, String> {
    let option = RequestOption {
        url: format!(
            "http://{}:{}/getBookshelf",
            ADDRESS.lock().unwrap(),
            PORT.lock().unwrap()
        ),
        method: Method::GET,
        query: None,
        body: None,
        headers: None,
        timeout: Some(5),
    };

    match request::<Vec<Book>>(option).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn get_chapter_list(url: String) -> Result<Response<Vec<Chapter>>, String> {
    let option = RequestOption {
        url: format!(
            "http://{}:{}/getChapterList",
            ADDRESS.lock().unwrap(),
            PORT.lock().unwrap()
        ),
        method: Method::GET,
        query: Some(vec![("url".to_string(), url)]),
        body: None,
        headers: None,
        timeout: Some(5),
    };
    match request::<Vec<Chapter>>(option).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn get_book_content(url: String, index: i32) -> Result<Response<String>, String> {
    let option = RequestOption {
        url: format!(
            "http://{}:{}/getBookContent",
            ADDRESS.lock().unwrap(),
            PORT.lock().unwrap()
        ),
        method: Method::GET,
        query: Some(vec![
            ("index".to_string(), index.to_string()),
            ("url".to_string(), url),
        ]),
        body: None,
        headers: None,
        timeout: Some(5),
    };
    match request::<String>(option).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn get_book_cover() {}

#[tauri::command]
pub fn get_content_image() {}

#[tauri::command]
pub async fn save_book_progress(progress: BookProgress) -> Result<Response<String>, String> {
    let option = RequestOption {
        url: format!(
            "http://{}:{}/saveBookProgress",
            ADDRESS.lock().unwrap(),
            PORT.lock().unwrap()
        ),
        method: Method::POST,
        query: None,
        body: Some(serde_json::to_string(&progress).unwrap()),
        headers: None,
        timeout: Some(5),
    };
    match request::<String>(option).await {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}
