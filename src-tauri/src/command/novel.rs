use crate::model::novel::{Novel, NovelConfig};
use font_kit::source::SystemSource;
use rdev::{listen, Button, EventType};
use std::fs::{metadata, remove_dir, remove_file};
use std::path::Path;
use std::sync::atomic::AtomicBool;
use std::sync::Mutex;
use tauri::Emitter;

static SCROLL: Mutex<AtomicBool> = Mutex::new(AtomicBool::new(false));

#[tauri::command(async)]
pub fn init(config: NovelConfig) -> Result<Vec<String>, String> {
    let instance = Novel::new();
    let mut novel = instance.lock().unwrap();
    if config.regexp.is_some() {
        novel.set_regex(config.regexp.unwrap())
    }
    match novel.decode(config.path) {
        Ok(_) => Ok(novel.chapter()),
        Err(err) => Err(err.to_string()),
    }
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

#[tauri::command]
pub fn start_mouse_wheel(webview_window: tauri::WebviewWindow) {
    if SCROLL
        .lock()
        .unwrap()
        .load(std::sync::atomic::Ordering::Relaxed)
    {
        return;
    } else {
        SCROLL
            .lock()
            .unwrap()
            .store(true, std::sync::atomic::Ordering::Relaxed);
    }
    tauri::async_runtime::spawn(async move {
        listen(move |event| match event.event_type {
            EventType::Wheel { delta_y, .. } => {
                if delta_y > 0 || delta_y < 0 {
                    webview_window.emit("scroll", delta_y).unwrap()
                }
            }
            EventType::ButtonRelease(Button::Middle) => webview_window.emit("hide", ()).unwrap(),
            _ => {}
        })
            .unwrap_err();
    });
}

#[tauri::command]
pub fn get_system_fonts() -> Result<Vec<String>, String> {
    let source = SystemSource::new();
    let families = match source.all_families() {
        Ok(families) => families,
        Err(e) => return Err(e.to_string()),
    };
    Ok(families)
}
