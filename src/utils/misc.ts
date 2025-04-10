import type { CapturedResponseEx } from "$/types"

// Round a number with the given precision for decimals
export function roundWithPrecision(num: number, precision: number) {
  const aux = Math.pow(10, precision)
  return (Math.ceil(num * aux) / aux)
}

// Convert the content of a response to Data URL
export function responseToDataURL (cr: CapturedResponseEx) {
  let useBase64 = cr.encoding === 'base64'
  const content = useBase64? `;base64,${cr.content}`
    : ',' + encodeURIComponent(cr.content)
  return `data:${cr.contentType}${content}`
}

// Show a number of Bytes as a readable string
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

// Check content type
export function isImageType (contentType: string) {
  return contentType.includes('image')
}
export function isTextType (contentType: string) {
  return contentType.includes('text') || contentType.includes('css') ||
    contentType.includes('html') || contentType.includes('xml') ||
    contentType.includes('javascript') || contentType.includes('json')
}
export function hasPreview (contentType: string) {
  return isImageType(contentType) || isTextType(contentType)
}
