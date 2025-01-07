use crate::model::novel::{Novel, NovelConfig};
use std::fs::{metadata, remove_dir, remove_file};
use std::path::Path;

#[tauri::command(async)]
pub fn init(config: NovelConfig) -> Vec<String> {
    let instance = Novel::new();
    let mut novel = instance.lock().unwrap();
    if config.regexp.is_some() {
        novel.set_regex(config.regexp.unwrap())
    }
    novel.decode(config.path);
    novel.chapter()
}

#[tauri::command]
pub fn chapter(title: String) -> String {
    let instance = Novel::new();
    let novel = instance.lock().unwrap();
    novel.single(title)
}

#[tauri::command(async)]
pub fn remove(path: String) -> bool {
    if Path::new(&path).exists() {
        if metadata(String::from(&path)).unwrap().is_dir() {
            remove_dir(String::from(&path)).is_ok()
        } else {
            remove_file(String::from(path)).is_ok()
        }
    } else {
        false
    }
}
