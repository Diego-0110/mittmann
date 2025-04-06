
export interface CapturedResponse {
  id: string
  contentType: string
  encoding?: string
  name: string
  size: number
}

export interface CapturedResponseEx  extends CapturedResponse {
  content: string
}

export interface CaptureOptions {
  activated: boolean
  mimeTypes: string[]
}
