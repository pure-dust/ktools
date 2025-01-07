export function rgb2hsl(rgb: string) {
  if (!/^rgb(a)?\(\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,?\s?\d?\.?\d{0,2}\)$/.test(rgb)) {
    return rgb
  }
  let r, g, b;
  [r, g, b] = rgb.match(/\d{1,3}/g)!.map(Number)
  let min = Math.min(r, g, b)
  let max = Math.max(r, g, b)
  let diff = max - min
  let h, s, l
  l = (min + max) / 2
  if (min === max) {
    h = s = 0
  } else {
    s = l > 0.5 ? diff / (2 - diff) : diff / (max + min)
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / diff + 2
        break
      case b:
        h = (r - g) / diff + 4
        break
    }
    h = Math.round(h! * 60)
  }
  s = Math.round(s * 100)
  h = Math.round(h * 60)
  return [h, s, l]
}

export function hex2rgb(hex: string) {
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex)) {
    return hex
  }
  if (hex.length === 4) {
    const [r, g, b] = hex.match(/[0-9a-fA-F]/g)!.map((num) => parseInt(num, 16))
    return `rgb(${r}, ${g}, ${b})`
  } else if (hex.length === 7) {
    const [r, g, b] = hex.match(/[0-9a-fA-F]{2}/g)!.map((num) => parseInt(num, 16))
    return `rgb(${r}, ${g}, ${b})`
  } else {
    const [r, g, b, a] = hex.match(/[0-9a-fA-F]{2}/g)!.map((num) => parseInt(num, 16))
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
  }
}

export function hex2hsl(hex: string) {
  return rgb2hsl(hex2rgb(hex))
}