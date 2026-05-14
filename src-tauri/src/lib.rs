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
    read_file,
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
            save_book_progress
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
    use crate::model::api_result::Chapter;

    #[test]
    fn it_works() {
        let json = r#"
        {
            "baseUrl": "",
            "bookUrl": "content://com.android.externalstorage.documents/tree/primary%3ADownload%2FQQ/document/primary%3ADownload%2FQQ%2F%E4%BD%A0%E7%9A%84%E7%9C%9F%E5%90%8D%E5%B7%B2%E7%BB%8F%E8%A2%AB%E6%88%91%E8%AF%86%E7%A0%B4%E4%BA%86.txt",
            "end": 658,
            "index": 0,
            "isPay": false,
            "isVip": false,
            "isVolume": false,
            "start": 3,
            "title": "前言",
            "titleMD5$delegate": {
              "_value": {},
              "initializer": {}
            },
            "url": "3fed0485baf559a2"
        }
        "#;
        let chapters = serde_json::from_str::<Chapter>(&json).unwrap();
        println!("{:?}", chapters);
    }
}
