
// Basic info of a captured response
export interface CapturedResponse {
  id: string
  contentType: string
  encoding?: string
  name: string
  size: number
}
// Info of a captured response saved in the database
export interface CapturedResponseEx  extends CapturedResponse {
  content: string
}
// Configuration
export interface CaptureOptions {
  activated: boolean
  mimeTypes: string[]
}
