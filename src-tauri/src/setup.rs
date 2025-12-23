use crate::model::novel::Novel;
use std::process::Command;
use tauri::image::Image;
use tauri::menu::{MenuBuilder, MenuEvent, MenuItem, Submenu};
use tauri::path::BaseDirectory;
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::utils::config::WindowEffectsConfig;
use tauri::utils::WindowEffect;
use tauri::window::Color;
use tauri::{App, AppHandle, Emitter, Listener, Manager, PhysicalSize, Theme, WebviewWindow};
#[derive(Debug, serde::Deserialize)]
struct TooltipPayload {
    name: String,
    title: String,
    chapter: usize,
    line: usize,
}

fn exec_command(command_str: &[&str]) {
    if cfg!(target_os = "windows") {
        Command::new("cmd")
            .arg("/c")
            .args(command_str)
            .output()
            .expect("exec command failed")
    } else {
        Command::new("sh")
            .arg("-c")
            .args(command_str)
            .output()
            .expect("exec command failed")
    };
}

fn create_novel(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    if let Some(novel) = app.get_webview_window("novel") {
        novel.show()?;
        novel.set_focus()?;
        return Ok(novel);
    }
    tauri::webview::WebviewWindowBuilder::new(
        app,
        "novel",
        tauri::WebviewUrl::App("/windows/novel/index.html".into()),
    )
    .fullscreen(false)
    .resizable(false)
    .inner_size(400.0, 24.0)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(true)
    .always_on_top(true)
    .build()
}

fn create_setting(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    if let Some(setting) = app.get_webview_window("setting") {
        if setting.is_visible()? {
            setting.hide()?;
        } else {
            setting.center()?;
            setting.show()?;
            setting.set_focus()?;
        }
        return Ok(setting);
    }
    tauri::WebviewWindowBuilder::new(
        app,
        "setting",
        tauri::WebviewUrl::App("/windows/setting/index.html".into()),
    )
    .fullscreen(false)
    .resizable(false)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(false)
    .always_on_top(false)
    .shadow(true)
    .inner_size(540.0, 400.0)
    .center()
    .effects(WindowEffectsConfig {
        effects: vec![WindowEffect::Acrylic],
        state: None,
        radius: None,
        color: Some(Color(0, 0, 0, 128)),
    })
    .theme(Some(Theme::Dark))
    .always_on_top(true)
    .build()
}

fn on_menu_event(app: &AppHandle, event: MenuEvent) {
    let config_dir = app.path().app_config_dir().unwrap();
    let config_file_path = config_dir.join("config.json");
    let cache_file_path = config_dir.join("cache");
    match event.id.as_ref() {
        "quit" => app.exit(0),
        "select" => app.emit("select", ()).unwrap(),
        "reload" => app.emit("reload", ()).unwrap(),
        "vscode_config" => exec_command(&["code", config_file_path.to_str().unwrap()]),
        "notepad_config" => exec_command(&["notepad", config_file_path.to_str().unwrap()]),
        "vscode_cache" => exec_command(&["code", cache_file_path.to_str().unwrap()]),
        "notepad_cache" => exec_command(&["notepad", cache_file_path.to_str().unwrap()]),
        "config_dir" => exec_command(&["start", config_dir.to_str().unwrap()]),
        "cache_dir" => exec_command(&["start", config_dir.to_str().unwrap()]),
        "setting" => {
            let setting = create_setting(app).unwrap();
            setting.set_size(PhysicalSize::new(540, 400)).unwrap();
        }
        "devtool_novel" => {
            if let Some(novel) = app.get_webview_window("novel") {
                novel.open_devtools();
            }
        }
        "devtool_setting" => {
            if let Some(setting) = app.get_webview_window("setting") {
                setting.open_devtools();
            }
        }
        _ => {}
    }
}

fn build_tray(app: &mut App) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();
    let icon_path = app
        .path()
        .resolve("icon.ico", BaseDirectory::Resource)
        .unwrap();
    let quit = MenuItem::with_id(&app_handle, "quit", "退出", true, None::<&str>).unwrap();
    let vscode_config = MenuItem::with_id(
        &app_handle,
        "vscode_config",
        "使用vscode打开",
        true,
        None::<&str>,
    )
    .unwrap();
    let notepad_config = MenuItem::with_id(
        &app_handle,
        "notepad_config",
        "使用记事本打开",
        true,
        None::<&str>,
    )
    .unwrap();
    let config_dir = MenuItem::with_id(
        &app_handle,
        "config_dir",
        "打开文件目录",
        true,
        None::<&str>,
    )
    .unwrap();
    let config = Submenu::with_id_and_items(
        app.handle(),
        "config_file",
        "配置文件",
        true,
        &[&vscode_config, &notepad_config, &config_dir],
    )
    .unwrap();
    let vscode_cache = MenuItem::with_id(
        &app_handle,
        "vscode_cache",
        "使用vscode打开",
        true,
        None::<&str>,
    )
    .unwrap();
    let notepad_cache = MenuItem::with_id(
        &app_handle,
        "notepad_cache",
        "使用记事本打开",
        true,
        None::<&str>,
    )
    .unwrap();
    let cache_dir =
        MenuItem::with_id(&app_handle, "cache_dir", "打开文件目录", true, None::<&str>).unwrap();
    let cache = Submenu::with_id_and_items(
        app.handle(),
        "config_file",
        "缓存文件",
        true,
        &[&vscode_cache, &notepad_cache, &cache_dir],
    )
        .unwrap();
    let devtool_novel = MenuItem::with_id(
        &app_handle,
        "devtool_novel",
        "打开书籍调试工具",
        true,
        None::<&str>,
    )
        .unwrap();
    let devtool_setting = MenuItem::with_id(
        &app_handle,
        "devtool_setting",
        "打开设置调试工具",
        true,
        None::<&str>,
    )
        .unwrap();
    let devtool = Submenu::with_id_and_items(
        app.handle(),
        "devtool",
        "调试工具",
        true,
        &[&devtool_novel, &devtool_setting],
    )
    .unwrap();
    let select = MenuItem::with_id(&app_handle, "select", "选择书籍", true, None::<&str>).unwrap();
    let reload = MenuItem::with_id(&app_handle, "reload", "重载", true, None::<&str>).unwrap();
    let setting = MenuItem::with_id(&app_handle, "setting", "设置", true, None::<&str>).unwrap();
    let menu = MenuBuilder::new(app)
        .items(&[&reload, &select, &setting, &config, &cache, &devtool, &quit])
        .build()
        .unwrap();
    let tray = TrayIconBuilder::new()
        .icon(Image::from_path(icon_path).unwrap())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(on_menu_event)
        .on_tray_icon_event(move |_, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                create_novel(&app_handle).unwrap();
            }
        })
        .build(app)?;
    Ok(tray)
}

pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let novel = create_novel(app.handle()).unwrap();
    novel.hide().unwrap();
    novel.set_size(PhysicalSize::new(400.0, 24.0)).unwrap();

    let tray = build_tray(app)?;

    app.listen("change-tip", move |event| {
        let data: TooltipPayload = serde_json::from_str(event.payload()).unwrap();
        let instance = Novel::new();
        let novel = instance.lock().unwrap();
        let process = (data.chapter as f64 / novel.chapter().len() as f64) * 100.0;
        let tooltip = format!(
            "书名: {}\n第{}章: {}\n行数: {}\n进度: {}%",
            data.name,
            data.chapter,
            data.title,
            data.line,
            format!("{:.2}", process)
        );
        tray.set_tooltip(Some(tooltip)).unwrap();
    });

    Ok(())
}
