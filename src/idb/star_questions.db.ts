import { openDB } from 'idb'

interface StarItem {
    pid: string
    course: number
    subject: number
    time: string
}

interface StarProgressData {
    folderName: string
    items: StarItem[]
}

const dbPromise = openDB('user-info', 1)

export async function getStarProgressFolders(): Promise<string[]> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readonly')
    const store = tx.objectStore('star_questions')
    const allFolders = await store.getAllKeys()
    return allFolders as string[]
}

export async function getFolderContent(folderName: string = 'wrong'): Promise<string[]> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readonly')
    const store = tx.objectStore('star_questions')
    const folder = await store.get(folderName)
    return folder ? folder.items : []
}

export async function addFolder(folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')

    const existingFolder = await store.get(folderName)
    if (existingFolder) {
        throw new Error('Folder already exists')
    }

    await store.put({ folderName, items: [] })
    await tx.done
}

export async function deleteFolder(folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')

    const folder = await store.get(folderName)
    if (!folder) {
        throw new Error('Folder does not exist')
    }

    await store.delete(folderName)
    await tx.done
}

export async function renameFolder(oldName: string = 'wrong', newName: string): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')

    const oldFolder = await store.get(oldName)
    const newFolder = await store.get(newName)

    if (!oldFolder) {
        throw new Error('Old folder does not exist')
    }

    if (newFolder) {
        throw new Error('New folder already exists')
    }

    await store.put({ folderName: newName, items: oldFolder.items })
    await store.delete(oldName)

    await tx.done
}

export async function addItemToFolder(item: StarItem, folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')

    const folder = (await store.get(folderName)) as StarProgressData | undefined
    if (!folder) {
        await store.put({ folderName, items: [item] }, folderName)
    } else {
        if (!folder.items.some((existingItem: StarItem) => existingItem.pid === item.pid)) {
            folder.items.push(item)
            await store.put({ folderName, items: folder.items }, folderName)
        }
    }

    await tx.done
}

export async function removeItemFromFolder(pid: string, folderName: string = 'wrong'): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')

    const folder = (await store.get(folderName)) as StarProgressData | undefined
    if (!folder) {
        throw new Error('Folder does not exist')
    }

    folder.items = folder.items.filter((item: StarItem) => item.pid !== pid)

    await store.put({ folderName, items: folder.items }, folderName)

    await tx.done
}

export async function checkStarExists(pid: string, folderName: string = 'wrong'): Promise<boolean> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readonly')
    const store = tx.objectStore('star_questions')

    const folder = await store.get(folderName)
    return folder ? folder.items.some((item: StarItem) => item.pid === pid) : false
}

export async function setStarProgress(starData: StarProgressData): Promise<void> {
    const db = await dbPromise
    const tx = db.transaction('star_questions', 'readwrite')
    const store = tx.objectStore('star_questions')
    await store.put(starData, starData.folderName)
    await tx.done
}
