import "./index.less"
import {useEffect, useState} from "react";

function loadImage(url: string) {
  return new Promise<string>((resolve, reject) => {
    let img = new Image();
    img.addEventListener("load", () => {
      resolve(url);
    })
    img.addEventListener("error", () => {
      reject()
    });
    img.src = url;
  })
}

interface CoverProps {
  src?: string
  title: string
  author: string
}

export default function Cover(props: CoverProps) {
  const [url, setUrl] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadImage(props.src || "").then(res => {
      setUrl(res)
      setSuccess(true)
    }).catch(() => {
      setSuccess(false)
    });
  }, [props.src])

  return (
    <div className={'cover'}>
      {success ? (
        <img src={url} alt=""/>
      ) : (
        <div className={'cus-image'}>
          <div>{props.title}</div>
          <div>{props.author || "佚名"}</div>
        </div>
      )}
    </div>
  )
}