// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::generate_handler;

mod command;
mod model;
mod setup;
mod utils;
use command::{
    api::{
        delete_book, get_book_content, get_book_cover, get_bookshelf, get_chapter_list,
        get_content_image, save_book, save_book_progress, set_address_port,
    },
    novel::{
        get_novel_books, get_system_fonts, novel_chapter, novel_init, remove, set_novel_book,
        start_mouse_wheel,
    },
    plugin::{get_plugin_file, get_plugin_list},
    system::{get_dpi_scale, read_file},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![
            novel_init,
            novel_chapter,
            remove,
            start_mouse_wheel,
            get_system_fonts,
            get_plugin_list,
            get_plugin_file,
            read_file,
            get_dpi_scale,
            get_bookshelf,
            save_book,
            set_address_port,
            delete_book,
            set_novel_book,
            get_novel_books,
            get_book_content,
            get_book_cover,
            get_chapter_list,
            get_content_image,
            save_book_progress,
        ])
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
    use crate::command::system::get_dpi_scale;
    use winapi::um::shellscalingapi::SetProcessDpiAwareness;

    #[test]
    fn it_works() {
        unsafe {
            let result = SetProcessDpiAwareness(1);
            if result == 0 {
                println!("DPI 感知设置成功");
            } else {
                println!("DPI 感知设置失败，错误码: {}", result);
            }
        }

        println!("系统缩放为{}", get_dpi_scale());
    }
}
