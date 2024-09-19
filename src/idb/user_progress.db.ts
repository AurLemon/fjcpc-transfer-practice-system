// src/idb/user_progress.db

import { openDB } from 'idb'

interface ProgressData {
    pid: string
    course: number
    subject: number
    time: string
}

const dbPromise = openDB('user-db', 1)

export async function getUserProgress(): Promise<ProgressData[]> {
    const db = await dbPromise
    return db.get('user_progress', 'progress') || []
}

export async function setUserProgress(progress: ProgressData[]) {
    const db = await dbPromise
    await db.put('user_progress', progress, 'progress')
}

export async function deleteUserProgress() {
    const db = await dbPromise
    await db.delete('user_progress', 'progress')
}

export async function checkQuestionExists(pid: string): Promise<boolean> {
    const db = await dbPromise
    const progressData: ProgressData[] = (await db.get('user_progress', 'progress')) || []

    return progressData.some((item) => item.pid === pid)
}
