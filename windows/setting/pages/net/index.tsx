import {useEffect, useState} from "react";
import {netNovel} from "~utils/net_novel.ts";
import './index.less'
import Cover from "~setting/pages/net/components/cover";
import {emit} from "@tauri-apps/api/event";

export default function Net() {
  const [books, setBooks] = useState<Array<Book>>([])

  useEffect(() => {
    netNovel.get_bookshelf().then((res) => {
      setBooks(res.data)
    })
  }, [])

  const setBook = async (book: Book) => {
    await emit("set_novel_book", {...book})
  }

  return (<>
    <div className={'net'}>
      {books.map((book, i) => (
        <div className={'book'} key={book.name + i}>
          <div className="inner" onClick={() => setBook(book)}>
            <div className={'top'}>
              <Cover src={book.coverUrl || book.customCoverUrl} title={book.name} author={book.author}/>
              <div className="desc">
                <div className={'name'}>{book.name}</div>
                <div className={'author'}>作者:{book.author || "佚名"}</div>
              </div>
            </div>
            <div className={'intro'} title={book.intro?.trim()}>简介:{book.intro?.trim()}</div>
          </div>
        </div>
      ))}
    </div>
  </>)
}