
export interface InterceptedResponse {
  id: string
  contentType: string
  encoding?: string
  name: string
  size: number
}

export interface InterceptedResponseEx  extends InterceptedResponse {
  content: string
}

export interface InterceptOptions {
  activated: boolean
}
