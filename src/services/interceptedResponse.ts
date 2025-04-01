import type { InterceptedResponseEx } from "$/types";
import { wrapIDBRequest } from "./db";


export async function addIntRes (db: IDBDatabase, interceptedResponse: InterceptedResponseEx) {
  const request = db.transaction('interceptedResponses', 'readwrite')
  .objectStore('interceptedResponses').add(interceptedResponse)
  await wrapIDBRequest(request)
}

export function getIntRes (db: IDBDatabase, id: string) {
  const request = db.transaction('interceptedResponses', 'readonly')
  .objectStore('interceptedResponses').get(id)
  return wrapIDBRequest<InterceptedResponseEx>(request)
}

export function getIntResAll (db: IDBDatabase) {
  const request = db.transaction('interceptedResponses', 'readonly')
  .objectStore('interceptedResponses').getAll()
  return wrapIDBRequest<InterceptedResponseEx[]>(request)
}

export async function deleteIntRes (db: IDBDatabase, id: string) {
  const request = db.transaction('interceptedResponses', 'readwrite')
  .objectStore('interceptedResponses').delete(id)
  await wrapIDBRequest(request)
}

export async function deleteAll (db: IDBDatabase) {
  const request = db.transaction('interceptedResponses', 'readwrite')
  .objectStore('interceptedResponses').clear()
  await wrapIDBRequest(request)
}
