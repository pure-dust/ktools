type Handler = (target: object, key: string, newValue: object, oldValue: object) => void

/**
 * 递归监听数据变化
 * @param obj 数据源
 * @param handler 处理函数
 * @param path 用于记录完整key路径，勿传
 */
export function deep_proxy<T extends object>(obj: T, handler: Handler, path: string[] = []) {
  return new Proxy<T>(obj, {
    get(target: any, key: string, receiver: any): any {
      const result = Reflect.get(target, key, receiver)
      if (typeof target[key] === 'object' && target[key] !== null) {
        return deep_proxy(result, handler, [...path, key.toString()])
      }
      return result
    },
    set(target: any, key: string, newValue: any, receiver: any): boolean {
      if (target[key] === newValue) {
        return true
      }
      let oldValue = target[key]
      let result = Reflect.set(target, key, newValue, receiver)
      if (result) {
        handler(target, [...path, key].join("."), newValue, oldValue)
      }
      return result
    }
  })
}

/**
 * 获取文件名称
 * @param path
 */
export function filename(path?: string): string {
  if (!path) {
    return ""
  }
  let reg = /[\\|/]/
  return path.split(reg).at(-1)?.split(".")?.[0] || path
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  } as T
}

export function equals(a: any, b: any): boolean {
  const equal = (a: any, b: any) => {
    if (typeof a !== typeof b) {
      return false
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) {
          return false
        }
      }
    } else if (typeof a === 'object' && typeof b === 'object') {
      let keys1 = Object.keys(a)
      let keys2 = Object.keys(b)
      if (keys1.length !== keys2.length) {
        return false
      }
      for (let key of keys1) {
        if (!keys2.includes(key)) {
          return false
        }
        if (!equal(a[key], b[key])) {
          return false
        }
      }
    } else {
      return a === b
    }
    return true
  }

  return equal(a, b)
}

