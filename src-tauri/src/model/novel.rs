use regex::Regex;
use serde::Deserialize;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::sync::{Arc, Mutex, OnceLock};

#[derive(Deserialize)]
pub struct NovelConfig {
    pub(crate) path: String,
    pub(crate) regexp: Option<String>,
}

pub struct Novel {
    title: String,
    path: String,
    content: HashMap<String, String>,
    chapter: Vec<String>,
    regex: String,
}
static INSTANCE: OnceLock<Arc<Mutex<Novel>>> = OnceLock::new();
const DEFAULT_REGEXP: &str = r"第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*";

impl Novel {
    pub fn new() -> Arc<Mutex<Novel>> {
        INSTANCE
            .get_or_init(|| {
                Arc::new(Mutex::new(Novel {
                    title: String::from(""),
                    path: String::from(""),
                    content: HashMap::new(),
                    chapter: Vec::new(),
                    regex: r"第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*".to_string(),
                }))
            })
            .clone()
    }

    pub fn set_regex(&mut self, regexp: String) {
        self.regex = regexp
    }

    pub fn decode(&mut self, path: String) {
        self.chapter.clear();
        self.content.clear();
        self.path = path.clone();
        self.title = get_filename(&path).unwrap_or_default();
        let regexp = Regex::new(&self.regex).unwrap_or(Regex::new(DEFAULT_REGEXP).unwrap());
        let file = File::open(path);
        let mut title = String::from("");
        let mut chapter = String::from("");
        match file {
            Ok(file) => {
                let reader = BufReader::new(file);
                for line in reader.lines() {
                    match line {
                        Ok(content) => {
                            if regexp.is_match(&content) {
                                if title.is_empty() {
                                    title = format!("{}\n", content);
                                } else if !chapter.is_empty() {
                                    self.content.insert(title.clone(), chapter.clone());
                                    self.chapter.push(title.clone());
                                    title = format!("{}\n", content);
                                    chapter.clear();
                                }
                            } else if !title.is_empty() {
                                chapter.push_str(&format!("{}\n", content));
                            }
                        }
                        Err(_err) => {
                            println!("Error reading line {}", _err);
                        }
                    }
                }
            }
            Err(_err) => {
                println!("Error reading file {}", _err);
            }
        }
        if !title.is_empty() && !chapter.is_empty() {
            self.chapter.push(title.clone());
            self.content.insert(title, chapter);
        }
    }

    pub fn chapter(&self) -> Vec<String> {
        self.chapter.clone()
    }

    pub fn single(&self, title: String) -> String {
        self.content.get(&title).unwrap().to_string()
    }
}

fn get_filename(url: &str) -> Option<String> {
    Path::new(&url)
        .file_name()
        .and_then(|name| name.to_str().and_then(|name| Some(name.to_string())))
}
