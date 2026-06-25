pub mod novel;
pub mod plugin;
pub mod api;
pub mod system;


#[macro_export]
macro_rules! command_collection {
    () => {
        generate_handler![
            // novel 模块的命令
            crate::command::novel::novel_init,
            crate::command::novel::novel_chapter,
            crate::command::novel::remove,
            crate::command::novel::start_mouse_wheel,
            crate::command::novel::get_system_fonts,
            crate::command::novel::set_novel_book,
            crate::command::novel::get_novel_books,
            // plugin 模块的命令
            crate::command::plugin::get_plugin_list,
            crate::command::plugin::get_plugin_file,
            // api 模块的命令
            crate::command::api::get_bookshelf,
            crate::command::api::save_book,
            crate::command::api::set_address_port,
            crate::command::api::delete_book,
            crate::command::api::get_book_content,
            crate::command::api::get_book_cover,
            crate::command::api::get_chapter_list,
            crate::command::api::get_content_image,
            crate::command::api::save_book_progress,
            // system 模块的命令
            crate::command::system::read_file,
            crate::command::system::get_dpi_scale,
        ]
    };
}