use crate::model::config::PLUGIN_DIR;
use serde::{Deserialize, Serialize};
use std::fs::{read_dir, read_to_string};
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};

#[derive(Deserialize, Serialize, Clone)]
pub struct PluginInfo {
    pub name: String,
    pub description: String,
    pub version: String,
    pub src: String,
}

pub fn get_plugin_info(path: PathBuf) -> Option<PluginInfo> {
    let info = path.join("plugin.json");
    if let Ok(content) = read_to_string(info) {
        return if let Ok(result) = serde_json::from_str::<PluginInfo>(&content) {
            Some(result)
        } else {
            None
        };
    }
    None
}

#[tauri::command(async)]
pub fn get_plugin_list(app: AppHandle) -> Result<Vec<PluginInfo>, String> {
    let path = app
        .path()
        .resolve(PLUGIN_DIR, BaseDirectory::Resource)
        .unwrap();
    let mut result: Vec<PluginInfo> = vec![];
    if let Ok(list) = read_dir(path) {
        for entry in list {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(plugin) = get_plugin_info(path) {
                        result.push(plugin)
                    }
                }
            }
        }
    } else {
        return Err(String::from("Failed to read plugin directory"));
    }
    Ok(result)
}

#[tauri::command(async)]
pub fn get_plugin_file(app: AppHandle, plugin: PluginInfo) -> Result<String, String> {
    let mut path = app
        .path()
        .resolve(PLUGIN_DIR, BaseDirectory::Resource)
        .unwrap();
    path = path.join(plugin.name).join(plugin.src);
    if let Ok(content) = read_to_string(path) {
        Ok(content)
    } else {
        Err(String::from("Failed to read plugin file"))
    }
}

