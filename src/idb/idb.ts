import { openDB, deleteDB } from 'idb'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'

export async function checkIndexedDBSupport(): Promise<boolean> {
    try {
        const db = await openDB('test-db', 1, {
            upgrade(db) {
                db.createObjectStore('test')
            }
        })
        await db.close()
        return true
    } catch {
        return false
    }
}

export async function initDB() {
    const userStore = useUserStore()
    const notifyStore = useNotifyStore()

    const isIndexedDBSupported = await checkIndexedDBSupport()

    if (!isIndexedDBSupported) {
        userStore.project.is_indexeddb_compatible = false
        notifyStore.addMessage('failed', '你的浏览器不支持 IndexedDB，本地缓存将被禁用')
        return
    } else {
        await deleteDB('test-db')
    }

    try {
        const db = await openDB('user-db', 1, {
            upgrade(db) {
                console.log('Upgrading database and creating object stores')
                if (!db.objectStoreNames.contains('user_progress')) {
                    const userProgressStore = db.createObjectStore('user_progress')
                    userProgressStore.createIndex('progressIndex', 'progress')
                    console.log('user_progress store created')
                }

                if (!db.objectStoreNames.contains('star_progress')) {
                    const starProgressStore = db.createObjectStore('star_progress')
                    starProgressStore.createIndex('wrongIndex', 'wrong')
                    console.log('star_progress store created')
                }

                if (!db.objectStoreNames.contains('questions')) {
                    db.createObjectStore('questions', { keyPath: 'unique_code' })
                    console.log('questions store created')
                }

                if (!db.objectStoreNames.contains('user_settings')) {
                    db.createObjectStore('user_settings', { keyPath: 'id' })
                    console.log('user_settings store created')
                }
            }
        })
        db.onerror = (event) => {
            if (event.target instanceof IDBDatabase) {
                notifyStore.addMessage('failed', 'IndexedDB 存储空间不足，某些功能可能受限')
            }
        }
    } catch (error) {
        console.error('Error during IndexedDB initialization:', error)
        userStore.project.is_indexeddb_compatible = false
        notifyStore.addMessage('failed', '初始化 IndexedDB 时出错，请检查浏览器设置' + error)
    }
}
