// src/stores/user.ts

import { defineStore } from 'pinia'
import { get, post } from '@/api/api'

import { getUserProgress, setUserProgress, checkQuestionExists, getProgressCount } from '@/idb/user_progress.db'
import { setStarProgress, checkStarExists, addItemToFolder, removeItemFromFolder } from '@/idb/star_questions.db'

import { useAuthStore } from './auth'
import { useQuestionStore } from './question'
import { useNotifyStore } from './notify'

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

export const useUserStore = defineStore('user', {
    state: () => ({
        login: {
            isLogged: false,
            refreshing: false
        },
        profile: {
            name: '',
            id_number: '',
            school: '',
            profession: '',
            last_login: '',
            reg_date: '',
            user_progress: {
                current: 0,
                total: 0
            }
        },
        setting: {
            local_storage_questions: true,
            auto_save_progress: true,
            auto_star_question: true
        }
    }),
    actions: {
        setLogin(status: boolean = true) {
            localStorage.setItem('isLogged', JSON.stringify(status))
        },
        readLogin() {
            const authStore: any = useAuthStore()

            if (authStore.readToken() !== null && authStore.readRefreshToken() !== null) {
                return true
            }
            return false
        },
        userLogout() {
            const authStore = useAuthStore()
            this.login.isLogged = false
            authStore.deleteToken()
            authStore.deleteRefreshToken()
            this.resetProfile()
        },
        resetProfile() {
            this.profile.name = ''
            this.profile.id_number = ''
            this.profile.school = ''
            this.profile.profession = ''
            this.profile.last_login = ''
            this.profile.reg_date = ''
        },
        async fetchUserProgress() {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()
            try {
                const response: any = await get('/user/progress', undefined, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.code === 200) {
                    const data = response.data.data
                    await setUserProgress(data)
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        this.fetchUserProgress()
                    } else if (response.data.data.type === 'token_not_exist' && !this.login.refreshing) {
                        this.login.isLogged = false
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', `获取用户进度时出现异常（${err}）`)
            }
        },
        async isProgress(pid: string): Promise<boolean> {
            try {
                const exists = await checkQuestionExists(pid)

                if (exists) {
                    return true
                } else {
                    return false
                }
            } catch (error) {
                return false
            }
        },
        async getAllProgress() {
            try {
                const data = await getUserProgress()
                return data
            } catch (err) {
                return []
            }
        },
        async addProgress(pid: string, course: number, subject: number, type: number) {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const userStore = useUserStore()
            const token = authStore.readToken()
            const pidArray = [pid]
            this.profile.user_progress.current++
            console.log(userStore.readLogin())

            try {
                let currentProgress = await getUserProgress()

                if (!Array.isArray(currentProgress)) {
                    currentProgress = []
                }

                if (userStore.readLogin()) {
                    const response: any = await post(
                        '/user/progress',
                        { pid: pidArray },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (response.data.code === 200) {
                        const serverProgress = await getUserProgress()

                        if (!serverProgress.some((item) => item.pid === pid)) {
                            const updatedProgress = [...serverProgress, { pid, course, subject, type, time: Date.now().toString() }]
                            await setUserProgress(updatedProgress)
                        }
                        return true
                    } else {
                        if (response.data.data.type === 'expiry_token') {
                            await authStore.refreshTokenAndRetry()
                            await this.addProgress(pid, course, subject, type)
                        } else if (response.data.data.type === 'token_not_exist') {
                            return false
                        } else {
                            return false
                        }
                    }
                } else {
                    if (!currentProgress.some((item) => item.pid === pid)) {
                        const updatedProgress = [...currentProgress, { pid, course, subject, type, time: Date.now().toString() }]
                        await setUserProgress(updatedProgress)
                    }
                    return true
                }
            } catch (err) {
                notifyStore.addMessage('failed', `添加用户进度时异常（${err}）`)
                return false
            }
        },
        async deleteProgress(pid: string): Promise<boolean> {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const userStore = useUserStore()
            const token = authStore.readToken()

            const pidArray = [pid]
            const type = 'delete'
            this.profile.user_progress.current--

            try {
                let currentProgress = await getUserProgress()

                if (!Array.isArray(currentProgress)) {
                    currentProgress = []
                }

                if (userStore.readLogin()) {
                    const response: any = await post(
                        '/user/progress',
                        { pid: pidArray, type },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (response.data.code === 200) {
                        const updatedProgress = currentProgress.filter((item) => item.pid !== pid)

                        await setUserProgress(updatedProgress)
                        return true
                    } else {
                        if (response.data.data.type === 'expiry_token') {
                            await authStore.refreshTokenAndRetry()
                            return await this.deleteProgress(pid)
                        } else if (response.data.data.type === 'token_not_exist') {
                            return false
                        } else {
                            return false
                        }
                    }
                } else {
                    const updatedProgress = currentProgress.filter((item) => item.pid !== pid)

                    await setUserProgress(updatedProgress)
                    return true
                }
            } catch (err) {
                notifyStore.addMessage('failed', `删除用户进度时服务器异常（${err}）`)
                return false
            }
        },
        async updateProgressCount() {
            const questionStore = useQuestionStore()
            this.profile.user_progress.current = await getProgressCount()
            this.profile.user_progress.total = questionStore.getCulturalCount() + questionStore.getProfessionCount()
        },
        async fetchStarProgress() {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()

            try {
                const response: any = await get('/user/star', undefined, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.code === 200) {
                    const starItems = response.data.data

                    const starProgressData: StarProgressData = {
                        folderName: 'wrong',
                        items: starItems
                    }

                    await setStarProgress(starProgressData)
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        await this.fetchStarProgress()
                    } else if (response.data.data.type === 'token_not_exist' && !this.login.refreshing) {
                        this.login.isLogged = false
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', `获取收藏数据时异常（${err}）`)
                console.log(err)
            }
        },
        async isStar(pid: string): Promise<boolean> {
            try {
                const exists = await checkStarExists(pid)
                return exists
            } catch (error) {
                return false
            }
        },
        async addStar(pid: string, course: number, subject: number, type: number): Promise<boolean> {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const userStore = useUserStore()
            const token = authStore.readToken()

            const starItem: StarItem = {
                pid,
                course,
                subject,
                time: new Date().toISOString()
            }

            try {
                if (userStore.readLogin()) {
                    const response: any = await post(
                        '/user/star',
                        { pid: [pid] },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (response.data.code === 200) {
                        const exists = await checkStarExists(pid, 'wrong')
                        if (!exists) {
                            await addItemToFolder(starItem, 'wrong')
                        }
                        return true
                    } else {
                        if (response.data.data.type === 'expiry_token') {
                            await authStore.refreshTokenAndRetry()
                            return await this.addStar(pid, course, subject, type)
                        } else if (response.data.data.type === 'token_not_exist') {
                            return false
                        } else {
                            return false
                        }
                    }
                } else {
                    const exists = await checkStarExists(pid, 'wrong')
                    if (!exists) {
                        await addItemToFolder(starItem, 'wrong')
                    }
                    return true
                }
            } catch (err) {
                notifyStore.addMessage('failed', `添加收藏时服务器异常（${err}）`)
                return false
            }
        },
        async deleteStar(pid: string): Promise<boolean> {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const userStore = useUserStore()
            const token = authStore.readToken()

            const pidArray = [pid]
            const type = 'delete'

            try {
                if (userStore.readLogin()) {
                    const response: any = await post(
                        '/user/star',
                        { type: type, pid: pidArray },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (response.data.code === 200) {
                        await removeItemFromFolder(pid, 'wrong')
                        return true
                    } else {
                        if (response.data.data.type === 'expiry_token') {
                            await authStore.refreshTokenAndRetry()
                            return await this.deleteStar(pid)
                        } else if (response.data.data.type === 'token_not_exist') {
                            return false
                        } else {
                            return false
                        }
                    }
                } else {
                    await removeItemFromFolder(pid, 'wrong')
                    return true
                }
            } catch (err) {
                notifyStore.addMessage('failed', `删除收藏时服务器异常（${err}）`)
                return false
            }
        }
    }
})
