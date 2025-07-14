const DB_NAME = "FileStorageDB"
const DB_VERSION = 2
const FILES_STORE = "files"
const FOLDERS_STORE = "folders"

export interface StoredFile {
  id: string
  blob: Blob
  uploadedAt: number
  folderId?: string
}

export interface StoredFolder {
  id: string
  name: string
  createdAt: number
}

class FileStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(FILES_STORE)) {
          const filesStore = db.createObjectStore(FILES_STORE, { keyPath: "id" })
          filesStore.createIndex("folderId", "folderId", { unique: false })
        }

        if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
          db.createObjectStore(FOLDERS_STORE, { keyPath: "id" })
        }
      }
    })
  }

  async storeFile(blob: Blob, folderId?: string): Promise<string> {
    if (!this.db) throw new Error("Database not initialized")

    const id = crypto.randomUUID()
    const file: StoredFile = {
      id,
      blob,
      uploadedAt: Date.now(),
      folderId,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readwrite")
      const store = transaction.objectStore(FILES_STORE)
      const request = store.add(file)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async getAllFiles(): Promise<StoredFile[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readonly")
      const store = transaction.objectStore(FILES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getFilesByFolder(folderId?: string): Promise<StoredFile[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readonly")
      const store = transaction.objectStore(FILES_STORE)

      if (folderId) {
        const index = store.index("folderId")
        const request = index.getAll(folderId)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      } else {
        const request = store.getAll()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result.filter((file) => !file.folderId))
      }
    })
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readwrite")
      const store = transaction.objectStore(FILES_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async createFolder(name: string): Promise<string> {
    if (!this.db) throw new Error("Database not initialized")

    const id = crypto.randomUUID()
    const folder: StoredFolder = {
      id,
      name,
      createdAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FOLDERS_STORE], "readwrite")
      const store = transaction.objectStore(FOLDERS_STORE)
      const request = store.add(folder)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async getAllFolders(): Promise<StoredFolder[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FOLDERS_STORE], "readonly")
      const store = transaction.objectStore(FOLDERS_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async deleteFolder(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FOLDERS_STORE], "readwrite")
      const store = transaction.objectStore(FOLDERS_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async renameFolder(id: string, newName: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FOLDERS_STORE], "readwrite")
      const store = transaction.objectStore(FOLDERS_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const folder = getRequest.result
        if (folder) {
          folder.name = newName
          const putRequest = store.put(folder)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error("Folder not found"))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async moveFilesToFolder(fileIds: string[], folderId?: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readwrite")
      const store = transaction.objectStore(FILES_STORE)
      let completed = 0

      fileIds.forEach((fileId) => {
        const getRequest = store.get(fileId)
        getRequest.onsuccess = () => {
          const file = getRequest.result
          if (file) {
            file.folderId = folderId
            const putRequest = store.put(file)
            putRequest.onsuccess = () => {
              completed++
              if (completed === fileIds.length) resolve()
            }
            putRequest.onerror = () => reject(putRequest.error)
          } else {
            completed++
            if (completed === fileIds.length) resolve()
          }
        }
        getRequest.onerror = () => reject(getRequest.error)
      })
    })
  }

  async getFileCount(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILES_STORE], "readonly")
      const store = transaction.objectStore(FILES_STORE)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

export const fileStorage = new FileStorage()
