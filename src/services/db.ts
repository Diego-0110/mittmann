
export function getIDBDatabase (): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const reqOpen = window.indexedDB.open('Mittmann', 3);
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

      db.createObjectStore('interceptedResponses', { keyPath: 'id' })
    }
  })
}

export function wrapIDBRequest<T = unknown> (request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T)
    request.onerror = reject
  })
}
