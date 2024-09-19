// src/idb/questions.db.ts
import { openDB } from 'idb'

// 初始化 IndexedDB
export const dbPromise = openDB('user-db', 1, {
    upgrade(db) {
        // 创建 questions 对象存储
        if (!db.objectStoreNames.contains('questions')) {
            db.createObjectStore('questions', { keyPath: 'unique_code' })
        }
        // 创建 user_settings 对象存储
        if (!db.objectStoreNames.contains('user_settings')) {
            db.createObjectStore('user_settings', { keyPath: 'id' })
        }
        // 创建 user_unique_codes 对象存储，用于存储每个 userSetting 对应的 unique_codes 顺序
        if (!db.objectStoreNames.contains('user_unique_codes')) {
            db.createObjectStore('user_unique_codes', { keyPath: 'user_id' })
        }
    }
})

// User Unique Codes 操作
export async function getUserUniqueCodes(user_id: string) {
    const db = await dbPromise
    return db.get('user_unique_codes', user_id)
}

export async function addUserUniqueCodes(user_id: string, unique_codes: string[]) {
    const db = await dbPromise
    await db.put('user_unique_codes', { user_id, unique_codes })
}

export async function updateUserUniqueCodes(user_id: string, unique_codes: string[]) {
    const db = await dbPromise
    const record = await db.get('user_unique_codes', user_id)
    if (record) {
        record.unique_codes = unique_codes
        await db.put('user_unique_codes', record)
    }
}
