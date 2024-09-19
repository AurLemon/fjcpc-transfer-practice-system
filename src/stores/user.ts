// src/stores/user.ts
import { defineStore } from 'pinia'
import { get, post } from '@/api/api'

import { getUserProgress, setUserProgress, checkQuestionExists } from '@/idb/user_progress.db'
import { setStarProgress, checkStarExists, addItemToFolder, removeItemFromFolder } from '@/idb/star_questions.db'

import { useAuthStore } from './auth'
import { useNotifyStore } from '@/stores/notify'

export const useUserStore = defineStore('user', {
    state: () => ({
        login: {
            isLogged: false
        },
        profile: {
            name: '',
            id_number: '',
            school: '',
            profession: '',
            last_login: '',
            reg_date: ''
        },
        project: {
            is_indexeddb_compatible: true
        },
        setting: {
            local_storage_questions: true
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
            this.profile = {
                name: '',
                id_number: '',
                school: '',
                profession: '',
                last_login: '',
                reg_date: ''
            }
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
                    const progressData = response.data.data
                    await setUserProgress(progressData)
                    notifyStore.addMessage('success', '用户进度已成功获取并保存到本地。')
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        this.fetchUserProgress()
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', '获取用户进度时出现异常')
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
        async addProgress(pid: string[], course: number, subject: number, type: number) {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()

            try {
                const response: any = await post(
                    '/user/progress',
                    { pid: pid },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.data.code === 200) {
                    const currentProgress = await getUserProgress()

                    for (const id of pid) {
                        if (currentProgress.some((item) => item.pid === id)) {
                            console.log(`题目 ${id} 已存在于用户进度中`)
                            continue
                        }

                        const updatedProgress = [...currentProgress, { pid: id, course, subject, type, time: Date.now().toString() }]

                        await setUserProgress(updatedProgress)
                    }

                    notifyStore.addMessage('success', '用户进度已成功更新。')
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
            } catch (error) {
                notifyStore.addMessage('failed', '添加用户进度时服务器异常')
                return false
            }
        },
        async deleteProgress(pid: string[], type: 'delete') {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()

            try {
                const response: any = await post(
                    '/user/progress',
                    { pid, type },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.data.code === 200) {
                    const currentProgress = await getUserProgress()

                    const updatedProgress = currentProgress.filter((item) => !pid.includes(item.pid))

                    await setUserProgress(updatedProgress)

                    notifyStore.addMessage('success', '用户进度已成功删除。')
                    return true
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        await this.deleteProgress(pid, type)
                    } else if (response.data.data.type === 'token_not_exist') {
                        return false
                    } else {
                        return false
                    }
                }
            } catch (error) {
                notifyStore.addMessage('failed', '删除用户进度时服务器异常')
                return false
            }
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
                    const starData = response.data.data
                    await setStarProgress(starData)
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        await this.fetchStarProgress()
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', '获取用户星标数据时异常')
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
        async addStar(pid: string[], course: number, subject: number, type: number) {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()

            try {
                const response: any = await post(
                    '/user/star',
                    { pid: pid },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.data.code === 200) {
                    for (const id of pid) {
                        const exists = await checkStarExists(id)
                        if (exists) {
                            continue
                        }

                        await addItemToFolder(id)
                    }
                    return true
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        await this.addStar(pid, course, subject, type)
                    } else if (response.data.data.type === 'token_not_exist') {
                        return false
                    } else {
                        return false
                    }
                }
            } catch (error) {
                notifyStore.addMessage('failed', '添加星标时服务器异常')
                return false
            }
        },
        async deleteStar(pid: string[], type: 'delete') {
            const authStore = useAuthStore()
            const notifyStore = useNotifyStore()
            const token = authStore.readToken()

            try {
                const response: any = await post(
                    '/user/star',
                    { pid, type },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.data.code === 200) {
                    for (const id of pid) {
                        await removeItemFromFolder(id)
                    }
                    return true
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await authStore.refreshTokenAndRetry()
                        await this.deleteStar(pid, type)
                    } else if (response.data.data.type === 'token_not_exist') {
                        return false
                    } else {
                        return false
                    }
                }
            } catch (error) {
                notifyStore.addMessage('failed', '删除星标时服务器异常')
                return false
            }
        }
    }
})
