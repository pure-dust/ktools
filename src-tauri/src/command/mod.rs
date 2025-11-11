use crate::model::config::PLUGIN_DIR;
use std::fs::read_to_string;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};

pub mod novel;
pub mod plugin;

#[tauri::command(async)]
pub fn read_file(app: AppHandle, plugin: String, path: String) -> Result<String, String> {
    let result_path = app
        .path()
        .resolve(PLUGIN_DIR, BaseDirectory::Resource)
        .unwrap()
        .join(plugin)
        .join(path);
    if let Ok(content) = read_to_string(result_path) {
        Ok(content)
    } else {
        Err("文件不存在".to_string())
    }
}
