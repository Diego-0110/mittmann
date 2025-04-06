export const DATABASE_NAME = 'Mittmann'
export const DATABASE_VERSION = 3
export const OBJECT_STORE_NAME = 'capturedResponses'

export function getIDBDatabase (): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const reqOpen = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    reqOpen.onerror = (evt) => {
      const target = evt.target as any
      console.log(`Error while opening Mittmann\'s indexedDB: ${target.error?.message}`)
      reject()
    }
    reqOpen.onsuccess = (evt) => {
      const target = evt.target as any
      resolve(target.result as IDBDatabase)
    }
    reqOpen.onupgradeneeded = (evt) => {
      const target = evt.target as any
      const db = target.result as IDBDatabase

      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' })
    }
  })
}

export function wrapIDBRequest<T = unknown> (request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T)
    request.onerror = reject
  })
}
