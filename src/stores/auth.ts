import { defineStore } from 'pinia'
import { get, post } from '@/api/api'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoading: false,
        token: localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refresh_token') || '',
        isTokenRefreshing: false
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
            this.isLoading = true
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
                    this.isLoading = false
                } else {
                    if (response.data.data.type === 'expiry_token') {
                        await this.refreshTokenAndRetry()
                    } else if (response.data.data.type === 'token_not_exist') {
                        userStore.login.isLogged = false
                        notifyStore.addMessage('failed', '登录状态失效，请重新登录。')
                        this.isLoading = false
                    } else {
                        notifyStore.addMessage('failed', '无法获取档案信息，请检查网络连接。')
                        this.isLoading = false
                    }
                }
            } catch (err) {
                notifyStore.addMessage('failed', '获取档案信息时返回或请求异常')
                this.isLoading = false
            }
        },
        async refreshTokenAndRetry() {
            const userStore = useUserStore()
            userStore.login.refreshing = true

            if (this.isTokenRefreshing) {
                return
            }

            this.isLoading = true
            this.isTokenRefreshing = true
            const notifyStore = useNotifyStore()

            const refreshToken = this.readRefreshToken()
            try {
                const response: any = await post('/auth/refresh', {
                    refresh_token: refreshToken
                })

                if (response.data.code === 200) {
                    const newAccessToken = response.data.data.access_token
                    const newRefreshToken = response.data.data.refresh_token

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
            } finally {
                this.isLoading = false
                setTimeout(() => {
                    this.isTokenRefreshing = false
                    userStore.login.refreshing = true
                }, 1500)
            }
        }
    }
})
