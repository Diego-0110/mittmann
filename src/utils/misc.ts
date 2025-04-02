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

export function base64ToFile(str: string, mimeType: string) {
  const content = atob(str)
  const buffer = new ArrayBuffer(content.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < content.length; i++) {
    view[i] = content.charCodeAt(i)
  }
  return new Blob([buffer], { type: mimeType })
}

export function blobToDataUrl (blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject()
    reader.readAsDataURL(blob)
  })
}
