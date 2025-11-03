// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::generate_handler;

mod command;
mod model;
mod setup;
use command::{chapter, init, remove, start_mouse_wheel};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![init, chapter, remove, start_mouse_wheel])
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .setup(setup::setup)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use crate::model;

    #[test]
    fn it_works() {
        let instance = model::novel::Novel::new();
        let mut novel = instance.lock().unwrap();
        novel.decode("C:\\Users\\93218\\Documents\\novel\\混沌小世界.txt".to_string()).unwrap();
        novel.chapter();
        println!("{:?}", novel.chapter())
    }
}
