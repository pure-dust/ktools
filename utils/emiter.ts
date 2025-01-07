export class Emitter {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(listener)
  }

  once(event: string, listener: Function) {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener)
      listener(...args)
    }
    this.on(event, onceListener)
  }

  off(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      return
    }
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners.has(event)) {
      return
    }
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        listener(...args)
      })
    }
  }
}