import {invoke} from "@tauri-apps/api/core";

export async function set_address_port(address: string, port: string): Promise<void> {
  return invoke("set_address_port", {address, port});
}

export async function get_bookshelf() {
  return invoke<NovelResponse<Array<Book>>>("get_bookshelf");
}

export async function get_chapter_list(url: string) {
  return invoke<NovelResponse<Array<Chapter>>>("get_chapter_list", {url})
}

export async function get_book_content(url: string, index: number) {
  return invoke<NovelResponse<string>>("get_book_content", {url, index});
}

export async function save_book_progress(progress: BookProgress) {
  return invoke("save_book_progress", {progress});
}