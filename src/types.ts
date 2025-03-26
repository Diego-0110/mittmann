
export interface InterceptedResponse {
  id: string
  contentType?: string
}

export interface InterceptedResponseEx  extends InterceptedResponse {
  content: string
}

export interface InterceptOptions {
  activated: boolean
}
