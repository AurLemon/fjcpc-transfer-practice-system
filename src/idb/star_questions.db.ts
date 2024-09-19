// src/idb/star_questions.db.ts

import { openDB } from 'idb'

interface StarProgressData {
    [folder: string]: string[] // 文件夹名为键，内容为 string[] 的数组
} 

const dbPromise = openDB('user-db', 1)

// 获取整个 star_progress 对象
async function getStarProgressObject(): Promise<StarProgressData> {
    const db = await dbPromise
    return (await db.get('star_progress', 'data')) || {}
}

// 获取所有文件夹名称
export async function getStarProgressFolders(): Promise<string[]> {
    const starProgress = await getStarProgressObject()
    return Object.keys(starProgress)
}

// 获取指定文件夹的内容，如果不传入文件夹名称，则默认为 'wrong'
export async function getFolderContent(folderName: string = 'wrong'): Promise<string[]> {
    const starProgress = await getStarProgressObject()
    return starProgress[folderName] || []
}

// 添加新文件夹，如果不传入文件夹名称，则默认为 'wrong'
export async function addFolder(folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (folderName in starProgress) {
        throw new Error('Folder already exists')
    }

    starProgress[folderName] = []
    await db.put('star_progress', starProgress, 'data')
}

// 删除文件夹，如果不传入文件夹名称，则默认为 'wrong'
export async function deleteFolder(folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (folderName in starProgress) {
        delete starProgress[folderName]
        await db.put('star_progress', starProgress, 'data')
    } else {
        throw new Error('Folder does not exist')
    }
}

// 重命名文件夹，如果不传入文件夹名称，则默认为 'wrong'
export async function renameFolder(oldName: string = 'wrong', newName: string): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (oldName in starProgress && newName && !(newName in starProgress)) {
        starProgress[newName] = starProgress[oldName]
        delete starProgress[oldName]
        await db.put('star_progress', starProgress, 'data')
    } else {
        throw new Error('Old folder does not exist, or new name is invalid')
    }
}

// 添加条目到指定文件夹，默认 'wrong' 文件夹
export async function addItemToFolder(pid: string, folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (!starProgress[folderName]) {
        starProgress[folderName] = []
    }

    if (!starProgress[folderName].includes(pid)) {
        starProgress[folderName].push(pid)
        await db.put('star_progress', starProgress, 'data')
    }
}

// 从指定文件夹中删除条目，默认 'wrong' 文件夹
export async function removeItemFromFolder(pid: string, folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const starProgress = await getStarProgressObject()

    if (starProgress[folderName]) {
        starProgress[folderName] = starProgress[folderName].filter((item) => item !== pid)
        await db.put('star_progress', starProgress, 'data')
    } else {
        throw new Error('Folder does not exist')
    }
}

// 检查某个 pid 是否存在于指定文件夹，默认 'wrong' 文件夹
export async function checkStarExists(pid: string, folderName: string = 'wrong'): Promise<boolean> {
    const folderContent = await getFolderContent(folderName)
    return folderContent.includes(pid)
}

// 设置整个 star_progress 对象（用于 fetchUserStar）
export async function setStarProgress(starData: StarProgressData): Promise<void> {
    const db = await dbPromise
    await db.put('star_progress', starData, 'data')
}
