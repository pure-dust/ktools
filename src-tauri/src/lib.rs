// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::generate_handler;

mod command;
mod model;
mod setup;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(command_collection!())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .plugin(tauri_plugin_notification::init())
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
        assert_eq!(get_dpi_scale(), 1.0);
    }
}
