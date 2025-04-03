import type { InterceptedResponseEx } from "$/types"

export function roundWithPrecision(num: number, precision: number) {
  const aux = Math.pow(10, precision)
  return (Math.ceil(num * aux) / aux)
}

export function responseToDataURL (ir: InterceptedResponseEx) {
  let useBase64 = ir.encoding === 'base64'
  const content = useBase64? `;base64,${ir.content}`
    : ',' + encodeURIComponent(ir.content)
  return `data:${ir.contentType}${content}`
}

const KB = Math.pow(2, 10)
const MB = Math.pow(2, 20)
const GB = Math.pow(2, 30)
export function sizeToStr (size: number) {
  if (size > GB) {
    return `${roundWithPrecision(size / GB, 2)} GB`
  } else if (size > MB) {
    return `${roundWithPrecision(size / MB, 2)} MB`
  } else if (size > KB) {
    return `${roundWithPrecision(size / KB, 2)} KB`
  } else {
    return `${size} B`
  }
}

