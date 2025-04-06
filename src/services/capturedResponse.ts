import type { CapturedResponseEx } from "$/types";
import { OBJECT_STORE_NAME, wrapIDBRequest } from "./db";


export async function addCapRes (db: IDBDatabase, capturedResponse: CapturedResponseEx) {
  const request = db.transaction(OBJECT_STORE_NAME, 'readwrite')
  .objectStore(OBJECT_STORE_NAME).add(capturedResponse)
  await wrapIDBRequest(request)
}

export function getCapRes (db: IDBDatabase, id: string) {
  const request = db.transaction(OBJECT_STORE_NAME, 'readonly')
  .objectStore(OBJECT_STORE_NAME).get(id)
  return wrapIDBRequest<CapturedResponseEx>(request)
}

export function getCapResAll (db: IDBDatabase) {
  const request = db.transaction(OBJECT_STORE_NAME, 'readonly')
  .objectStore(OBJECT_STORE_NAME).getAll()
  return wrapIDBRequest<CapturedResponseEx[]>(request)
}

export async function deleteCapRes (db: IDBDatabase, id: string) {
  const request = db.transaction(OBJECT_STORE_NAME, 'readwrite')
  .objectStore(OBJECT_STORE_NAME).delete(id)
  await wrapIDBRequest(request)
}

export async function deleteAll (db: IDBDatabase) {
  const request = db.transaction(OBJECT_STORE_NAME, 'readwrite')
  .objectStore(OBJECT_STORE_NAME).clear()
  await wrapIDBRequest(request)
}
