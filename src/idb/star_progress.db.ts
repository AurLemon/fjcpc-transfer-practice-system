// src/idb/star_questions.db

import { openDB } from 'idb'

interface StarProgressData {
    [folder: string]: string[] // 文件夹名为键，内容为 string[] 的数组
}

const dbPromise = openDB('user-db', 1)

async function getStarProgressObject(): Promise<StarProgressData> {
    const db = await dbPromise
    return (await db.get('star_progress', 'data')) || {}
}

// 获取所有文件夹名称
export async function getStarProgressFolders(): Promise<string[]> {
    const starProgress = await getStarProgressObject()
    return Object.keys(starProgress).filter((folder) => folder !== 'wrong')
}

// 获取指定文件夹的内容
export async function getFolderContent(folderName: string): Promise<string[]> {
    const starProgress = await getStarProgressObject()
    return starProgress[folderName] || []
}

// 添加新文件夹
export async function addFolder(folderName: string): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (folderName in starProgress || folderName === 'wrong') {
        throw new Error('Folder already exists or is a reserved name')
    }

    starProgress[folderName] = []
    await db.put('star_progress', starProgress, 'data')
}

// 删除文件夹
export async function deleteFolder(folderName: string): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (folderName in starProgress && folderName !== 'wrong') {
        delete starProgress[folderName]
        await db.put('star_progress', starProgress, 'data')
    } else {
        throw new Error('Folder does not exist or is a reserved name')
    }
}

// 重命名文件夹
export async function renameFolder(oldName: string, newName: string): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (oldName in starProgress && newName && !(newName in starProgress) && newName !== 'wrong') {
        starProgress[newName] = starProgress[oldName]
        delete starProgress[oldName]
        await db.put('star_progress', starProgress, 'data')
    } else {
        throw new Error('Old folder does not exist, new name is invalid, or new name is a reserved name')
    }
}

// 获取 "wrong" 文件夹中的内容
export async function getWrongItems(): Promise<string[]> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()
    return starProgress['wrong'] || []
}

// 设置 "wrong" 文件夹的内容
export async function setWrongItems(wrong: string[]): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()
    starProgress['wrong'] = wrong
    await db.put('star_progress', starProgress, 'data')
}

// 删除 "wrong" 文件夹中的内容
export async function deleteWrongItems(): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()
    if ('wrong' in starProgress) {
        starProgress['wrong'] = []
        await db.put('star_progress', starProgress, 'data')
    }
}
