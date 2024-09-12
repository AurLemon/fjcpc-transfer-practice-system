// src/stores/auth.ts
import { defineStore } from 'pinia'

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
        }
    }
})
