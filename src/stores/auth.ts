import { defineStore } from 'pinia'
import { get, post } from '@/api/api'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refresh_token') || ''
    }),
    actions: {
        setToken(token: string) {
            this.token = token
            localStorage.setItem('token', token)
        },
        setRefreshToken(refreshToken: string) {
            this.refreshToken = refreshToken
            localStorage.setItem('refresh_token', refreshToken)
        },
        readToken() {
            return localStorage.getItem('token')
        },
        readRefreshToken() {
            return localStorage.getItem('refresh_token')
        },
        deleteToken() {
            localStorage.removeItem('token')
        },
        deleteRefreshToken() {
            localStorage.removeItem('refresh_token')
        },
        async getUserProfile() {
            const userStore = useUserStore()
            const notifyStore = useNotifyStore()
            userStore.login.isLogged = true
            const token = this.readToken()
            try {
                const response: any = await get('/user/profile', undefined, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.code === 200) {
                    userStore.profile = response.data.data
                } else {
                    if (response.data.data.type === 'expiry') {
                        await this.refreshTokenAndRetry()
                    } else if (response.data.data.type === 'not_exist') {
                        userStore.login.isLogged = false
                        notifyStore.addMessage('failed', '登录状态失效，请重新登录。')
                    } else {
                        notifyStore.addMessage('failed', '无法获取档案信息，请检查网络连接。')
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', '无法获取档案信息，请检查网络连接。')
            }
        },
        async refreshTokenAndRetry() {
            const userStore = useUserStore()
            const notifyStore = useNotifyStore()

            const refreshToken = this.readRefreshToken()
            try {
                const response: any = await post('/auth/refresh', {
                    refresh_token: refreshToken
                })
                if (response.data.code === 200) {
                    const newAccessToken = response.data.tokens.access_token
                    const newRefreshToken = response.data.tokens.refresh_token

                    this.setToken(newAccessToken)
                    this.setRefreshToken(newRefreshToken)

                    await this.getUserProfile()
                } else {
                    this.deleteToken()
                    this.deleteRefreshToken()
                    notifyStore.addMessage('failed', '刷新 token 失败，请重新登录。')
                }
            } catch (err) {
                notifyStore.addMessage('failed', '无法刷新 token，请重新登录。')
            }
        }
    }
})
